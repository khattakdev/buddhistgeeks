import { PrismaClient} from '@prisma/client'
import { multiRouteHandler, ResultType, Request} from '../../../src/apiHelpers'
import { getToken } from '../../../src/token'

export type UserCohortsResult = ResultType<typeof getUserCohorts>
export type UserCoursesResult = ResultType<typeof getUserCourses>
export type WhoAmIResult = ResultType<typeof whoami>
export type CheckUsernameResult = ResultType<typeof checkUsername>

let prisma = new PrismaClient()

export default multiRouteHandler('item', {
  'user_cohorts': getUserCohorts,
  'user_courses': getUserCourses,
  'username': checkUsername,
  'whoami': whoami,
})

async function getUserCohorts(req:Request) {
  let token = getToken(req)
  if(!token) return {status: 403 as const, result: "Error: no user logged in"}
  let [course_cohorts, invited_courses, events] = await Promise.all([
    prisma.course_cohorts.findMany({
      where:{
        OR: [
          {people_in_cohorts: {some: {person: token.id}}},
          {cohort_facilitators: {some:{facilitator: token.id}}}
        ]
      },
      include:{
        courses: {select: {name: true, slug: true, card_image: true, id: true, type: true, description: true, cohort_max_size: true}},
        cohort_facilitators: true,
        cohort_events: {
          where:{
            OR:[
              {everyone: true},
              {events:{people:{id:token.id}}},
              {events:{people_in_events:{some:{people:{id: token.id}}}}}
            ]
          },
          select: {
            events: true
          }
        },
        people: {
          select: {
            display_name: true,
            username: true,
          }
        }
      },
    }),
    prisma.courses.findMany({
      where:{
        course_invites: {
          some: {
            email: token.email
          }
        }
      }
    }),
    prisma.standalone_events.findMany({
      include:{events: true},
      where:{
        events:{AND:[
          {OR:[
              {created_by: token.id},
              {people_in_events:{some:{person: token.id}}}
          ]},
          {end_date:{gte:new Date().toISOString()}}
        ]}
      }
    })
  ])

  return {status: 200, result: {course_cohorts, invited_courses, events}} as const
}
async function getUserCourses(req: Request) {
  let token = getToken(req)
  if(!token) return {status: 403 as const, result: "Error: no user logged in"}

  let [maintaining_courses, watching_courses] = await Promise.all([
    prisma.courses.findMany({
      where: {
        course_maintainers: {
          some: {
            maintainer: token.id
          }
        }
      },
      include: {
        course_cohorts: {
          select: {start_date: true}
        }
      }
    }),
    prisma.watching_courses.findMany({
      where: {
        email: token.email
      }
    })
  ])
  return {status: 200, result: {maintaining_courses, watching_courses}} as const
}

async function whoami(req:Request) {
  let token = getToken(req)
  return {status: 200, result: token || false } as const
}

async function checkUsername(req:Request){
  let username = req.query.item[1]
  let headers = {"Cache-Control": 's-maxage=60000, stale-while-revalidate'}
  let people = await prisma.people.findFirst({where:{username: {
    equals: username,
    mode: "insensitive",
  }}, select:{username: true}})
  return !!people
    ? {status: 200, result: '', headers} as const
    : {status: 404, result: '', headers} as const
}
