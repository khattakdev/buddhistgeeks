import { ResultType, APIHandler, Request} from 'src/apiHelpers'
import * as t from 'runtypes'
import { getToken } from 'src/token'
import {PrismaClient} from '@prisma/client'
let prisma = new PrismaClient()

export default APIHandler({POST: createEvent, GET: getPublicEvents})
export type CreateEventMsg = t.Static<typeof CreateEventValidator>
export type CreateEventResponse = ResultType<typeof createEvent>
export type GetEventsResponse = ResultType<typeof getPublicEvents>

let CreateEventValidator = t.Intersect(t.Record({
  start_date: t.String,
  end_date: t.String,
  description: t.String,
  location: t.String,
  name: t.String,
}), t.Union(t.Record({
  type: t.Literal('cohort'),
  cohort: t.Number,
  people: t.Union(t.Undefined, t.Array(t.String))
}), t.Record({
  type: t.Literal('standalone'),
  cost: t.Number,
  max_attendees: t.Number
})))

export const getPublicEventsQuery = ()=>prisma.standalone_events.findMany({
  select:{
    cost: true,
    events: true,
    event: true,
    max_attendees: true,
    standalone_events_in_courses: true
  }
})

async function getPublicEvents() {
  let events = await getPublicEventsQuery()
  return {status: 200, result: {events}} as const
}

async function createEvent(req:Request) {
  let msg
  try {msg = CreateEventValidator.check(req.body)}
  catch(e) {return {status:400, result:e.toString()} as const }

  let user = getToken(req)
  if(!user) return {status: 401 , result: "ERROR: no user logged in"} as const

  switch(msg.type){
      case 'cohort': {
        let cohort = await prisma.course_cohorts.findUnique({
          where: {id: msg.cohort},
          select:{
            cohort_facilitators: {include:{people: {select:{username:true}}}},
            people_in_cohorts: {select:{people: {select: {username: true}}}}
          }})
        if(!cohort) return {status: 404, result: `ERROR: no cohort with id ${msg.cohort} found`} as const

        if(!cohort.cohort_facilitators.find(f=> user&&f.facilitator ===user.id) &&
          !cohort.people_in_cohorts.find(p=>user&&p.people.username===user.username)) return {status: 401, result: "ERROR: user is not enrolled or a facilitator of the cohort"} as const
        if(msg.people){
          for(let username of msg.people) {
            if(!cohort.people_in_cohorts.find(p=>p.people.username === username) &&
              cohort.cohort_facilitators.find(f=>f.people.username===username)) return {status:400, result: `ERROR: can't add person who is not part of the cohort or facilitator`} as const
          }
        }

        let event = await prisma.cohort_events.create({
          include: {
            events: {
              include: {
                people_in_events: {select:{people:{select:{username: true, display_name: true, id: true}}}},
              }
            }
          },
          data: {
            everyone: msg.people ? msg.people.length === 0 : true,
            course_cohorts: {
              connect: {
                id: msg.cohort
              }
            },
            events: {
              create: {
                people:{connect:{id: user.id}},
                people_in_events: !msg.people ? undefined : {
                  create: msg.people.map(p=>{
                    return {people:{connect:{username: p}}}
                  })
                },
                start_date: msg.start_date,
                end_date: msg.end_date,
                name: msg.name,
                location: msg.location,
                description: msg.description,
              }
            }
          }
        })
        return  {status: 200, result: {type: 'cohort', event}} as const
      }
      case 'standalone': {
        let event = await prisma.standalone_events.create({
          include: {
            events: {
              include: {
                people_in_events: {select:{people:{select:{username: true, display_name: true}}}},
              }
            }
          },
          data: {
            cost: msg.cost,
            max_attendees: msg.max_attendees,
            events: {
              create: {
                people:{connect:{id: user.id}},
                start_date: msg.start_date,
                end_date: msg.end_date,
                name: msg.name,
                location: msg.location,
                description: msg.description,
              },
            }
          }
        })
        return {status: 200, result: {type: 'standalone', event}} as const
      }
  }
}
