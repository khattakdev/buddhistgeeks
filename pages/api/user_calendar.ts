import { events, PrismaClient } from "@prisma/client";
import ICAL from "ical.js";
import { NextApiRequest, NextApiResponse } from "next";

let prisma = new PrismaClient();

export default async function getUserEvents(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let calendar_ID = req.query.id as string;
  let calendar = new ICAL.Component(["vcalendar", [], []]);
  calendar.updatePropertyWithValue("version", "2.0");
  calendar.updatePropertyWithValue("prodid", "hyperlink.academy");
  calendar.updatePropertyWithValue("method", "PUBLISH");
  calendar.updatePropertyWithValue("name", "Hyperlink Calendar");
  calendar.updatePropertyWithValue("x-wr-calname", "Hyperlink Calendar");

  let [user_cohorts, facilitator_cohorts, standalone] = await Promise.all([
    prisma.people_in_cohorts.findMany({
      where: {
        people: { calendar_id: calendar_ID },
        course_cohorts: { live: true },
      },
      select: {
        course_cohorts: {
          select: {
            id: true,
            courses: {
              select: {
                name: true,
              },
            },
            cohort_events: {
              where: {
                OR: [
                  { everyone: true },
                  { events: { people: { calendar_id: calendar_ID } } },
                  {
                    events: {
                      people_in_events: {
                        some: { people: { calendar_id: calendar_ID } },
                      },
                    },
                  },
                ],
              },
              select: {
                events: true,
              },
            },
          },
        },
      },
    }),
    prisma.course_cohorts.findMany({
      where: {
        live: true,
        cohort_facilitators: {
          some: {
            people: {
              calendar_id: calendar_ID,
            },
          },
        },
      },
      select: {
        id: true,
        courses: {
          select: {
            name: true,
          },
        },
        cohort_events: {
          select: {
            events: true,
          },
        },
      },
    }),
    prisma.standalone_events.findMany({
      select: {
        events: true,
      },
      where: {
        OR: [
          {
            events: {
              people_in_events: {
                some: { people: { calendar_id: calendar_ID } },
              },
            },
          },
          {
            events: { people: { calendar_id: calendar_ID } },
          },
        ],
      },
    }),
  ]);

  let enrolled_events = user_cohorts.flatMap((cohort) => {
    let course = cohort.course_cohorts.courses.name;
    let cohort_id = cohort.course_cohorts.id;
    return cohort.course_cohorts.cohort_events.map((ev) => {
      return { ...ev.events, course, cohort_id };
    });
  });
  let facilitating_events = facilitator_cohorts.flatMap((cohort) => {
    let course = cohort.courses.name;
    let cohort_id = cohort.id;
    return cohort.cohort_events.map((ev) => {
      return { ...ev.events, course, cohort_id };
    });
  });

  let standalone_events = standalone.map((ev) => {
    return ev.events;
  });

  let events: Array<
    events & Partial<{ course: string; cohort_id: number }>
  > = standalone_events.concat(enrolled_events).concat(facilitating_events);

  for (let event of events) {
    let vevent = new ICAL.Component("vevent");
    let calEvent = new ICAL.Event(vevent);
    calEvent.uid = "hyperlink-" + event.id;
    calEvent.description = event.description;
    calEvent.summary = event.course
      ? event.course + " - " + event.name
      : event.name;
    calEvent.location = event.location;
    calEvent.startDate = ICAL.Time.fromJSDate(new Date(event.start_date), true);
    calEvent.endDate = ICAL.Time.fromJSDate(new Date(event.end_date), true);

    calendar.addSubcomponent(vevent);
  }

  res.setHeader("Content-type", "text/calendar");
  res.send(calendar.toString());
}
