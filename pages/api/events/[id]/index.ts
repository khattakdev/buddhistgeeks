import { APIHandler, Request, ResultType } from "src/apiHelpers";
import { PrismaClient } from "@prisma/client";
import { getToken } from "src/token";
import * as t from 'runtypes'
import produce from "immer";
import { sendEventUpdateNoAccountEmail } from "emails";
import { createEventInvite } from "src/calendar";

let prisma = new PrismaClient()
export default APIHandler({
  POST: updateEvent,
  DELETE: deleteEvent,
  GET: getEvent
})
export type UpdateEventMsg = t.Static<typeof UpdateEventValidator>
export type UpdateEventResult = ResultType<typeof updateEvent>
export type DeleteEventResult = ResultType<typeof deleteEvent>
export type GETEventResult = ResultType<typeof getEvent>

let UpdateEventValidator = t.Intersect(
  t.Record({data: t.Partial({
    start_date: t.String,
    end_date: t.String,
    description: t.String,
    location: t.String,
    name: t.String,
  })}),
  t.Union(
    t.Record({
      type: t.Literal('cohort'),
      cohort: t.Number,
      data: t.Partial({
        people: t.Union(t.Undefined, t.Array(t.String))
      })
    }), t.Record({
      type: t.Literal('standalone'),
      data: t.Partial({
        cost: t.Number,
        max_attendees: t.Number
      })
    })
  ))

export const eventDataQuery = async (id: number, userId?:string)=>{
  let event = await prisma.events.findUnique({
    where: {id},
    include:{
      people: {select:{display_name: true, username: true, bio: true, id: true}},
      people_in_events: {include:{people:{select:{display_name: true, username: true, pronouns: true, email: true}}}},
      no_account_rsvps: true,
      cohort_events: true,
      standalone_events: {
        include: {
          standalone_events_in_courses: true
        }
      }
    }
  })
  if(!event) return
  let people_in_events = event.people_in_events.map(person=>produce(person, p=>{if(event?.created_by!==userId)p.people.email=''}))
  let no_accounts_rsvps = event.no_account_rsvps.map(person=>event?.created_by!==userId ? {...person, email:''} : person)

  if(userId != event.created_by && !event.people_in_events.find(p=>p.person===userId)) {
    return {...event, people_in_events, location: ''}
  }
  return {...event, people_in_events, no_accounts_rsvps}
}

async function getEvent(req:Request) {
  let user = getToken(req)
  let eventId = parseInt(req.query.id as string)
  if(Number.isNaN(eventId)) return {status: 400, result: "ERROR: event id is not a number"} as const
  let event = await eventDataQuery(eventId, user?.id)
  if(!event) return {status:404, result: 'ERROR: no event with id found'} as const
  return {status:200, result: event} as const
}

async function updateEvent(req:Request) {
  let eventId = parseInt(req.query.id as string)
  if(Number.isNaN(eventId)) return {status: 400, result: "ERROR: event id is not a number"} as const
  let msg
  try {msg = UpdateEventValidator.check(req.body)}
  catch(e) {
    return {status:400, result:e.toString()} as const
  }

  let user = getToken(req)
  if(!user) return {status: 401 , result: "ERROR: no user logged in"} as const

  let event = await prisma.events.findUnique({where:{id: eventId}, select:{id: true, created_by: true, no_account_rsvps: true, name: true}})
  if(!event) return {status:404, result: 'ERROR: no event found'} as const

  switch(msg.type){
      case 'cohort': {
        let cohort = await prisma.course_cohorts.findUnique({where: {id: msg.cohort}, select:{facilitator: true}})
        if(!cohort) return {status: 404, result: `ERROR: no cohort with id ${msg.cohort} found`} as const

        if(cohort.facilitator !== user.id && event.created_by!==user.id) return {status: 401, result: "ERROR: user is not a facilitator of the cohort"} as const

        let newEvent = await prisma.cohort_events.update({
          where:{cohort_event:{cohort: msg.cohort, event: eventId}},
          include: {
            events: {
              include: {
                people_in_events: {select:{people:{select:{username: true, display_name: true, id: true}}}},
              }
            }
          },
          data:{
            everyone: msg.data.people ? msg.data.people.length === 0 : undefined,
            events:{
              update:{
                location: msg.data.location,
                start_date: msg.data.start_date,
                end_date: msg.data.end_date,
                description: msg.data.description,
                name: msg.data.name,
                people_in_events: {
                  deleteMany:{event: eventId},
                  create: msg.data.people?.map(p=>{
                    return {
                      people:{connect:{username: p}}
                    }
                  })
                }
              }
            }
          }
        })
        return {status: 200, result: {type: 'cohort', data: newEvent}} as const
      }
      case 'standalone': {
        if(event.created_by !== user.id) return {status: 401, result: "ERROR: user is not a facilitator of the cohort"} as const
        let newEvent = await prisma.standalone_events.update({
          where:{event:eventId},
          include: {
            standalone_events_in_courses: true,
            events: {include: {
              people: true,
              no_account_rsvps: true,
              people_in_events: {where: {person: user.id}, include:{people:{select:{display_name: true, username: true, pronouns: true, email: true}}}}
            }},
          },
          data: {
            cost: msg.data.cost,
            max_attendees: msg.data.max_attendees,
            events:{
              update:{
                start_date: msg.data.start_date,
                end_date: msg.data.end_date,
                description: msg.data.description,
                name: msg.data.name,
              }
            }
          }
        })

        if(msg.data.start_date || msg.data.end_date || msg.data.location || msg.data.location || msg.data.name) {
          let Content = Buffer.from(createEventInvite({
            id: newEvent.events.id,
            description: newEvent.events.description,
            start_date: newEvent.events.start_date,
            end_date: newEvent.events.end_date,
            summary: newEvent.events.name,
            location: newEvent.events.location
          }).toString()).toString('base64')

          await sendEventUpdateNoAccountEmail(event.no_account_rsvps.map(rsvp=> {
            return {
              email: rsvp.email,
              vars: {
                name: rsvp.name,
                event_name: event?.name || '',
                event_page_url: `https://hyperlink.academy/events/${event?.id}`,
              },
              data: {Attachments: [
                {Name: "event.ics", ContentType: "text/calender", ContentID: null, Content}]}}
          }))
        }

        return {status: 200, result: {type: 'standalone', data: newEvent}} as const
      }
  }

}

async function deleteEvent(req:Request) {
  let eventId = parseInt(req.query.id as string)
  if(Number.isNaN(eventId)) return {status: 400, result: "ERROR: Cohort id is not a number"} as const
  let user = getToken(req)
  if(!user) return {status: 401 , result: "ERROR: no user logged in"} as const

  let event = await prisma.events.findUnique({
    where: {id: eventId},
    select: {
      created_by: true,
      cohort_events: {
        select:{
          course_cohorts: {
            select:{facilitator: true, people_in_cohorts:{select:{people:{select: {username: true}}}}}
          }
        }
      }
    }
  })

  if(!event) return {status: 404, result: `ERROR: no event with id ${eventId} found`} as const

  if(event.cohort_events[0]?.course_cohorts.facilitator !== user.id && user.id !== event.created_by) return {status: 401, result: "ERROR: user is not a facilitator of the cohort this event is in"} as const

  await prisma.cohort_events.deleteMany({where: {event: eventId}}),
  await prisma.people_in_events.deleteMany({where:{event: eventId}})
  await prisma.events.delete({
    where: {id: eventId}
  })
  return {status: 200, result: true}
}
