import { APIHandler, Request, ResultType } from "src/apiHelpers";
import { PrismaClient } from "@prisma/client";

let prisma = new PrismaClient();

export default APIHandler(getCohortEvents);

export type GetCohortEventResponse = ResultType<typeof getCohortEvents>;

async function getCohortEvents(req: Request) {
  let cohortId = parseInt(req.query.cohortId as string);
  if (Number.isNaN(cohortId))
    return { status: 400, result: "ERROR: Cohort id is not a number" } as const;
  let cohort_events = await prisma.cohort_events.findMany({
    where: {
      cohort: cohortId,
    },
    select: {
      events: {
        select: {
          start_date: true,
          end_date: true,
          description: true,
          name: true,
        },
      },
    },
  });
  return { status: 200, result: cohort_events } as const;
}
