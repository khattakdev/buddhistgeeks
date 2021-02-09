import { PrismaClient } from "@prisma/client"
import { ResultType, APIHandler, Request } from "src/apiHelpers"
import { getToken } from "src/token";
import { createTopic } from "src/discourse";

let prisma = new PrismaClient()
export type PostTopicMsg = {
  title: string,
  body: string,
  tags: string[]
}
export type PostTopicResponse = ResultType<typeof postTopic>

export default APIHandler(postTopic)

async function postTopic(req:Request) {
  let msg = req.body as Partial<PostTopicMsg>
  let courseId = req.query.id
  let cohortId = parseInt(req.query.cohortId as string)
  if(Number.isNaN(cohortId)) return {status: 400, result: "ERROR: Cohort id is not a number"} as const

  if(!msg.title || !msg.body || !msg.tags) return {status:400, result: "ERROR: missing field title, body, or tags"} as const
  let user = getToken(req)
  if(!user) return {status: 400, result: "ERROR: no user logged in"} as const

  let cohort = await prisma.course_cohorts.findUnique({
    where: {id: cohortId},
    select:{
      facilitator: true,
      id: true,
      category_id: true,
      courses: {select: {id: true, slug: true}}}
  })
  if(!cohort) return {status:404, result: `ERROR: Cannot find cohort ${cohortId} in course ${courseId}`} as const
  if(cohort.facilitator !== user.id) return {status:401, result:`ERROR: User is not facilitator of cohort`} as const

  let topic = await createTopic({
    title: msg.title,
    raw: msg.body,
    category: cohort.category_id,
    tags: msg.tags
  }, user.username)
  if(!topic)  return {status:500, result: "ERROR: Unable to create topic"} as const
  return {status:200, result: {topic}} as const
}
