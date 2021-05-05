import { PrismaClient } from "@prisma/client";
import { ResultType, APIHandler, Request } from "src/apiHelpers";
import { getToken } from "src/token";
import { sendWatchingNotificationEmail } from "emails";
import { prettyDate } from "src/utils";
import produce from "immer";
import { updateCategory, updateGroup } from "src/discourse";

let prisma = new PrismaClient();
export type UpdateCohortMsg = {
  data: Partial<{
    completed: true;
    live: boolean;
    start_date: string;
    name: string;
    description: string;
  }>;
};

export type UpdateCohortResponse = ResultType<typeof updateCohort>;
export type CohortResult = ResultType<typeof getCohortData>;

export default APIHandler({ POST: updateCohort, GET: getCohortData });
async function updateCohort(req: Request) {
  let msg = req.body as Partial<UpdateCohortMsg>;
  let cohortId = parseInt(req.query.cohortId as string);
  if (Number.isNaN(cohortId))
    return { status: 400, result: "ERROR: Cohort id is not a number" } as const;

  if (!msg.data)
    return {
      status: 400,
      result: "Error: invalid request, missing data",
    } as const;

  let user = getToken(req);
  if (!user)
    return { status: 400, result: "ERROR: no user logged in'" } as const;
  let cohort = await prisma.course_cohorts.findUnique({
    where: { id: cohortId },
    select: {
      name: true,
      cohort_facilitators: true,
      completed: true,
      live: true,
      start_date: true,
      course: true,
      category_id: true,
      discourse_groups: true,
      courses: {
        select: {
          name: true,
          slug: true,
          description: true,
        },
      },
    },
  });
  if (!cohort)
    return {
      status: 404,
      result: `No cohort with id ${cohortId} found`,
    } as const;
  if (
    !cohort.cohort_facilitators.find((f) => user && f.facilitator === user.id)
  )
    return {
      status: 401,
      result: `ERROR: User is not facilitator of cohort`,
    } as const;

  let completed;
  if (msg.data.completed && !cohort.completed) {
    completed = new Date().toISOString();
  }

  if (msg.data.name && cohort.name !== msg.data.name) {
    await Promise.all([
      updateGroup(
        cohort.discourse_groups.id,
        cohort.courses.slug + "-" + msg.data.name
      ),
      updateCategory(cohort.category_id, {
        name: cohort.courses.slug + "-" + msg.data.name,
      }),
    ]);
  }

  if (cohort.live === false && msg.data.live === true) {
    // If we're toggling a cohort live, notify those watching
    let watchers = await prisma.watching_courses.findMany({
      where: { course: cohort.course },
      select: { email: true },
    });
    await sendWatchingNotificationEmail(
      watchers.map((watcher) => {
        if (!cohort) return;
        return {
          email: watcher.email,
          Metadata: {
            type: "course-watching-notification",
            course: cohort.course.toString(),
          },
          vars: {
            course_name: cohort.courses.name,
            cohort_page_url: `https://hyperlink.academy/courses/${cohort.courses.slug}/${cohort.course}/cohorts/${cohortId}`,
            cohort_start_date: prettyDate(cohort.start_date),
            course_description: cohort.courses.description,
          },
        };
      })
    );
  }

  let newData = await prisma.course_cohorts.update({
    where: { id: cohortId },
    data: {
      live: msg.data.live,
      completed,
      name: msg.data.name,
      start_date: msg.data.start_date,
      description: msg.data.description,
    },
  });
  if (!newData)
    return {
      status: 404,
      result: `No cohort with id ${cohortId} found`,
    } as const;
  return { status: 200, result: newData } as const;
}

export const cohortDataQuery = async (id: number, userId?: string) => {
  let data = await prisma.course_cohorts.findUnique({
    where: { id },
    select: {
      description: true,
      name: true,
      category_id: true,
      start_date: true,
      id: true,
      live: true,
      completed: true,
      cohort_facilitators: {
        select: {
          facilitator: true,
          people: {
            select: {
              display_name: true,
              username: true,
              bio: true,
              pronouns: true,
            },
          },
        },
      },
      people: {
        select: {
          display_name: true,
          username: true,
          bio: true,
          pronouns: true,
        },
      },
      cohort_events: {
        include: {
          events: {
            include: {
              people_in_events: {
                select: {
                  people: {
                    select: { username: true, display_name: true, id: true },
                  },
                },
              },
            },
          },
        },
      },
      courses: {
        select: {
          name: true,
          card_image: true,
          cohort_max_size: true,
          id: true,
          type: true,
          slug: true,
          cost: true,
          duration: true,
          description: true,
          category_id: true,
        },
      },
      people_in_cohorts: {
        include: {
          people: {
            select: {
              display_name: true,
              pronouns: true,
              username: true,
              email: true,
            },
          },
        },
      },
    },
  });
  if (!data) return;

  let enrolled = data.people_in_cohorts.find((x) => x.person === userId);
  let isFacilitator = data.cohort_facilitators.find(
    (f) => f.facilitator === userId
  );

  let cohort_events = data.cohort_events
    .filter(
      (c) =>
        c.everyone ||
        isFacilitator ||
        (enrolled &&
          c.events.people_in_events.find((p) => p.people.id === userId))
    )
    .map((event) =>
      produce(event, (e) => {
        if (!enrolled && !isFacilitator) e.events.location = "";
      })
    );
  let people_in_cohorts = data.people_in_cohorts.map((person) =>
    produce(person, (p) => {
      if (!isFacilitator) p.people.email = "";
    })
  );
  return { ...data, cohort_events, people_in_cohorts };
};

async function getCohortData(req: Request) {
  let cohortId = parseInt(req.query.cohortId as string);
  if (Number.isNaN(cohortId))
    return { status: 400, result: "ERROR: Cohort id is not a number" } as const;
  let user = getToken(req);

  let data = await cohortDataQuery(cohortId, user?.id);
  if (!data)
    return {
      status: 404,
      result: `Error: no cohort with id ${cohortId} found`,
    } as const;

  return { status: 200, result: data } as const;
}
