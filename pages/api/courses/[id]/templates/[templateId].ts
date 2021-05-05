import { ResultType, APIHandler, Request } from "src/apiHelpers";
import { getToken } from "src/token";
import { PrismaClient } from "@prisma/client";
let prisma = new PrismaClient();

export type UpdateTemplateMsg = {
  name?: string;
  title?: string;
  content?: string;
  type?: "prepopulated" | "triggered";
};
export type UpdateTemplateResult = ResultType<typeof updateTemplate>;
export type DeleteTemplateResult = ResultType<typeof deleteTemplate>;

export default APIHandler({ POST: updateTemplate, DELETE: deleteTemplate });

async function deleteTemplate(req: Request) {
  let courseId = parseInt(req.query.id as string);
  if (Number.isNaN(courseId))
    return { status: 400, result: "ERROR: Course id is not a number" } as const;
  let templateId = req.query.templateId as string;
  let user = getToken(req);
  if (!user)
    return { status: 401, result: "ERROR: no user logged in" } as const;

  let course_maintainer = await prisma.course_maintainers.findUnique({
    where: {
      course_maintainer: {
        course: courseId,
        maintainer: user.id,
      },
    },
  });

  if (!course_maintainer)
    return {
      status: 401,
      result: "ERROR: user is not maintainer of this course",
    } as const;
  try {
    await prisma.course_templates.delete({
      where: {
        name_course: {
          name: templateId,
          course: courseId,
        },
      },
    });
    return { status: 200, result: "" } as const;
  } catch (e) {
    return { status: 400, result: "Unable to delete template" } as const;
  }
}

async function updateTemplate(req: Request) {
  let msg = req.body as Partial<UpdateTemplateMsg>;
  let courseId = parseInt(req.query.id as string);
  if (Number.isNaN(courseId))
    return { status: 400, result: "ERROR: Course id is not a number" } as const;

  let templateId = req.query.templateId as string;
  let user = getToken(req);
  if (!user)
    return { status: 401, result: "ERROR: no user logged in" } as const;

  let course_maintainer = await prisma.course_maintainers.findUnique({
    where: {
      course_maintainer: {
        course: courseId,
        maintainer: user.id,
      },
    },
  });

  if (!course_maintainer)
    return {
      status: 401,
      result: "ERROR: user is not maintainer of this course",
    } as const;
  let template = await prisma.course_templates.findUnique({
    where: {
      name_course: {
        name: templateId,
        course: courseId,
      },
    },
  });
  if (!template)
    return {
      status: 404,
      result: "ERROR: cannot find template with name " + templateId,
    } as const;
  let updatedTemplate = await prisma.course_templates.update({
    where: {
      name_course: {
        name: templateId,
        course: courseId,
      },
    },
    data: {
      name: template.required ? template.name : msg.name,
      title: msg.title,
      content: msg.content,
      type: template.required ? template.type : msg.type,
    },
  });
  return { status: 200, result: updatedTemplate };
}
