import { ResultType, APIHandler, Request } from "src/apiHelpers";
import * as rt from "runtypes";
import { getToken } from "src/token";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
let prisma = new PrismaClient();

export default APIHandler({ GET: getDiscounts, POST: createDiscount });
export type GetDiscountsResult = ResultType<typeof getDiscounts>;

async function getDiscounts(req: Request) {
  let user = getToken(req);
  if (!user)
    return { status: 401, result: "ERROR: no user logged in" } as const;

  let courseID = parseInt(req.query.id as string);
  if (Number.isNaN(courseID))
    return { status: 400, result: "ERROR: Course id is not a number" } as const;

  let [maintainer, discounts] = await Promise.all([
    prisma.course_maintainers.findUnique({
      where: { course_maintainer: { course: courseID, maintainer: user.id } },
    }),
    prisma.course_discounts.findMany({
      where: { course: courseID, deleted: false },
    }),
  ]);

  if (!maintainer)
    return {
      status: 401,
      result: "ERROR: user is not a maintainer of this course",
    } as const;
  return { status: 200, result: discounts } as const;
}

export type CreateDiscountMsg = rt.Static<typeof CreateDiscountValidator>;
export type CreateDiscountResult = ResultType<typeof createDiscount>;

export const CreateDiscountValidator = rt.Record({
  amount: rt.Number,
  name: rt.String,
  type: rt.Union(rt.Literal("percentage"), rt.Literal("absolute")),
  max_redeems: rt.Number.Or(rt.Undefined),
});

async function createDiscount(req: Request) {
  let msg;
  try {
    msg = CreateDiscountValidator.check(req.body);
  } catch (e) {
    return { status: 400, result: e.toString() } as const;
  }

  let user = getToken(req);
  if (!user)
    return { status: 401, result: "ERROR: no user logged in" } as const;

  let courseID = parseInt(req.query.id as string);
  if (Number.isNaN(courseID))
    return { status: 400, result: "ERROR: Course id is not a number" } as const;
  let maintainer = await prisma.course_maintainers.findUnique({
    where: { course_maintainer: { course: courseID, maintainer: user.id } },
  });

  if (!maintainer)
    return {
      status: 401,
      result: "ERROR: user is not a maintainer of this course",
    } as const;

  let discount = await prisma.course_discounts.create({
    data: {
      courses: { connect: { id: courseID } },
      name: msg.name,
      type: msg.type,
      code: uuidv4(),
      amount: msg.amount,
      max_redeems: msg.max_redeems,
    },
  });
  return { status: 200, result: discount } as const;
}
