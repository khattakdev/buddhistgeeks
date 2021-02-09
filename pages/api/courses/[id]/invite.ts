import { Request, ResultType, APIHandler} from "../../../../src/apiHelpers"
import { PrismaClient } from "@prisma/client"
import { sendInviteToCourseEmail } from "../../../../emails"

export type InviteToCourseMsg = ({ email: string, username: undefined} | {username: string, email: undefined})
export type InviteToCourseResponse = ResultType<typeof inviteToCourse>
let prisma = new PrismaClient()

export default APIHandler(inviteToCourse)
async function inviteToCourse(req:Request) {
  let msg = req.body as Partial<InviteToCourseMsg>
  let courseID = parseInt(req.query.id as string)
  if(Number.isNaN(courseID)) return {status: 400, result: "ERROR: Course id is not a number"} as const

  if(!msg.email && !msg.username) return {status: 400, result: "ERROR: Must include username or email"} as const

  let email = msg.email?.toLowerCase() || ''
  let name = ''
  if(msg.username) {
    let person = await prisma.people.findFirst({where: {username: {equals: msg.username, mode: 'insensitive'}}, select:{email: true, display_name: true}})
    if(!person) return {status: 404, result: `no user with username ${msg.username} found`} as const
    email = person.email
    name = person.display_name || ''
  }

  let courseData = await prisma.courses.findUnique({where: {id: courseID}, select:{name: true, slug:true}})
  if(!courseData) return {status:404, result: `ERROR: no course found with id ${courseID}`}

  await prisma.course_invites.create({data: {
    email,
    courses: {
      connect: {
        id: courseID
      }
    }
  }})

  await sendInviteToCourseEmail(email, {
    course_url: `https://hyperlink.academy/courses/${courseData.slug}/${courseID}`,
    course_name: courseData.name,
    name
  })

  return {status: 200, result: {email}} as const
}
