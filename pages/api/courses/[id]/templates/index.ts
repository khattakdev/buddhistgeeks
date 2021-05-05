import { ResultType, APIHandler, Request } from "src/apiHelpers";
import { getToken } from "src/token";
import { PrismaClient } from "@prisma/client";
let prisma = new PrismaClient();

export type CreateTemplateMsg = {
  name: string;
  title: string;
  content: string;
  type: "prepopulated" | "triggered";
};
export type CreateTemplateResult = ResultType<typeof createTemplate>;
export type GetTemplatesResult = ResultType<typeof getTemplates>;
export default APIHandler({ GET: getTemplates, POST: createTemplate });

async function createTemplate(req: Request) {
  let msg = req.body as Partial<CreateTemplateMsg>;
  let user = getToken(req);
  if (
    !msg.name ||
    !msg.title ||
    !msg.content ||
    (msg.type !== "prepopulated" && msg.type !== "triggered")
  )
    return { status: 400, result: "ERROR: Invalid message" } as const;

  let courseID = parseInt(req.query.id as string);
  if (Number.isNaN(courseID))
    return { status: 400, result: "ERROR: Course id is not a number" } as const;

  let course = await prisma.courses.findUnique({
    where: { id: courseID },
    select: {
      course_maintainers: true,
    },
  });
  if (!course)
    return {
      status: 404,
      result: "ERROR: course " + courseID + " not found",
    } as const;
  if (!course.course_maintainers.find((x) => user && x.maintainer === user.id))
    return {
      status: 401,
      result: "ERROR: User is not maintainer of course",
    } as const;

  let template = await prisma.course_templates.create({
    data: {
      name: msg.name,
      title: msg.title,
      content: msg.content,
      type: msg.type,
      courses: {
        connect: {
          id: courseID,
        },
      },
    },
  });

  return { status: 200, result: template } as const;
}

export const getTemplatesQuery = (courseId: number) =>
  prisma.course_templates.findMany({ where: { course: courseId } });

async function getTemplates(req: Request) {
  let courseID = parseInt(req.query.id as string);
  if (Number.isNaN(courseID))
    return { status: 400, result: "ERROR: Course id is not a number" } as const;

  let user = getToken(req);
  if (!user)
    return { status: 400, result: "ERROR: No user logged in!" } as const;
  let course = await prisma.courses.findUnique({
    where: { id: courseID },
    select: {
      course_templates: true,
      course_maintainers: true,
    },
  });

  if (!course)
    return {
      status: 404,
      result: "ERROR: course " + courseID + " not found",
    } as const;
  if (!course.course_maintainers.find((x) => user && x.maintainer === user.id))
    return {
      status: 401,
      result: "ERROR: User is not maintainer of course",
    } as const;
  return { status: 200, result: course.course_templates } as const;
}
