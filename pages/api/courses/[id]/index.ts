import { ResultType, APIHandler, Request} from '../../../../src/apiHelpers'
import { getToken } from '../../../../src/token'
import { PrismaClient } from '@prisma/client'
import { updateCategory } from '../../../../src/discourse'

const prisma = new PrismaClient()

export type UpdateCourseMsg = Partial<{
  cost: number,
  name: string,
  status: "live",
  prerequisites?: string
  duration?: string
  description: string
}>
export type UpdateCourseResponse = ResultType<typeof updateCourse>
export type CourseDataResult = ResultType<typeof getCourseData>

export default APIHandler({POST: updateCourse, GET:getCourseData})

async function updateCourse(req: Request) {
  let msg = req.body as Partial<UpdateCourseMsg>
  let courseId = req.query.id as string
  let user = getToken(req)
  if(!user) return {status: 403, result: "ERROR: No user logged in"} as const
  let course = await prisma.courses.findOne({
    where:{id: courseId},
    select: {
      status: true,
      name: true,
      category_id: true,
      course_maintainers: {where: {maintainer: user.id}}
    }
  })
  if(!course || course.course_maintainers.length === 0) return {
    status: 403,
    result: `ERROR: user is not maintainer of course ${courseId}`
  } as const

  if(course.status === 'draft' && msg.status === 'live') {
    if(!await updateCategory(course.category_id, {permissions: {everyone: 1}, name: course.name})) return {status:500, result: "ERROR: unable to update course category"} as const
  }

  let newData = await prisma.courses.update({
    where: {id: courseId},
    data: {
      duration: msg.duration,
      status: msg.status,
      prerequisites: msg.prerequisites,
      description: msg.description,
      cost: msg.cost,
      name: msg.name
    }
  })

  return {status: 200, result: {prerequisites: newData.prerequisites, duration: newData.duration}} as const
}

export const courseDataQuery = (id:string) => prisma.courses.findOne({
  where: {id },
  include: {
    course_maintainers: {
      include: {
        people: {select: {display_name: true}}
      }
    },
    course_templates: true,
    course_cohorts: {
      include: {
        courses: {
          select: {
            name: true
          }
        },
        people: {
          select: {
            display_name: true,
            username: true
          }
        },
        people_in_cohorts: {
          select: {
            people: {
              select: {
                id: true
              }
            }
          }
        }
      }
    }
  }
})

async function getCourseData(req: Request) {
  let id = req.query.id as string
  let data = await courseDataQuery(id)

  if(!data) return {status: 403, result: `ERROR: no course with id ${id} found`} as const
  return {status:200, result: data} as const
}
