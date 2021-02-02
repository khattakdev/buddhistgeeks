import { Request, ResultType, APIHandler} from "../../../../src/apiHelpers"
import { PrismaClient } from "@prisma/client"
import { getToken } from "src/token"
let prisma = new PrismaClient()

export type WatchCourseMsg = {
  watching: boolean
  email?: string
}
export type WatchCourseResult = ResultType<typeof watchCourse>

export default APIHandler(watchCourse)

async function watchCourse(req:Request) {
  let msg = req.body as Partial<WatchCourseMsg>
  let courseId = parseInt(req.query.id as string)
  if(typeof msg.watching !== 'boolean') return {status: 400, result: "ERROR: no watching property on request"} as const

  if(Number.isNaN(courseId)) return {status: 400, result: "ERROR: Course id is not a number"} as const
  let user = getToken(req)
  let email:string
  if(!user) {
    if(!msg.email) return {status:400, result:"ERROR: No user logged in and no email provided"}
    email = msg.email
  }
  else email = user.email

  if(msg.watching === true) {
    await prisma.watching_courses.upsert({
      where: {
        email_course:{
          course:courseId,
          email
        }
      },
      create: {
        courses: {
          connect: {
            id: courseId
          }
        },
        email
      },
      update: {
        courses: {
          connect: {
            id: courseId
          }
        },
        email
      }
    })
  }
  else {
    await prisma.watching_courses.deleteMany({
      where: {
        email,
        course: courseId
      }
    })
  }

  return {status: 200, result: ""}
}
