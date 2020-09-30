import { PrismaClient } from "@prisma/client";
import ICAL from 'ical.js'
import { NextApiRequest, NextApiResponse } from "next";

let prisma = new PrismaClient()

export default async function getUserEvents(req: NextApiRequest, res: NextApiResponse) {
  let calendar_ID = req.query.id as string
  let calendar = new ICAL.Component(['vcalendar',[],[]])
  calendar.updatePropertyWithValue('prodid', 'hyperlink.academy');

  let user_cohorts= await prisma.people_in_cohorts.findMany({
    where: {
      people: {calendar_id: calendar_ID}
    },
    select: {
      course_cohorts: {
        select: {
          id: true,
          courses: {
            select: {
              name: true
            }
          },
          cohort_events: {
            select: {
              events: true
            }
          }
        }
      }
    }
  })

  let events = user_cohorts.flatMap(cohort => {
    let course = cohort.course_cohorts.courses.name
    let cohort_id = cohort.course_cohorts.id
    return cohort.course_cohorts.cohort_events.map(ev => {return {...ev.events, course, cohort_id}})
  })

  for(let event of events) {
    let vevent = new ICAL.Component('vevent')
    let calEvent = new ICAL.Event(vevent)
    calEvent.uid = 'hyperlink-'+event.id
    calEvent.description = event.description
    calEvent.summary = event.course + ' - ' + event.name
    calEvent.location = event.location
    calEvent.startDate = ICAL.Time.fromJSDate(new Date(event.start_date))
    calEvent.endDate = ICAL.Time.fromJSDate(new Date(event.end_date))

    calendar.addSubcomponent(vevent)
  }

  res.setHeader('Content-type', "text/calendar")
  res.send(calendar.toString())
}