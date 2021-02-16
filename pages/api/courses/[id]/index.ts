import { ResultType, APIHandler, Request} from '../../../../src/apiHelpers'
import { getToken } from '../../../../src/token'
import { PrismaClient } from '@prisma/client'
import { updateCategory, updateGroup } from '../../../../src/discourse'
import { slugify } from 'src/utils'
import * as t from 'runtypes'

const prisma = new PrismaClient()

export type UpdateCourseMsg = t.Static<typeof UpdateCourseMsgValidator>

const UpdateCourseMsgValidator = t.Partial({
  invite_only: t.Boolean,
  cost: t.Number,
  cohort_max_size: t.Number,
  name: t.String,
  card_image: t.String,
  status: t.Union(t.Literal("live"), t.Literal('draft')),
  prerequisites: t.String,
  duration: t.String,
  description: t.String
})

export type UpdateCourseResponse = ResultType<typeof updateCourse>
export type CourseDataResult = ResultType<typeof getCourseData>

export default APIHandler({POST: updateCourse, GET:getCourseData})

async function updateCourse(req: Request) {
  let msg
  try {msg = UpdateCourseMsgValidator.check(req.body)}
  catch(e) {return {status:400, result:e.toString()} as const }

  let courseId = parseInt(req.query.id as string)
  if(Number.isNaN(courseId)) return {status: 400, result: "ERROR: Course id is not a number"} as const
  let user = getToken(req)
  if(!user) return {status: 403, result: "ERROR: No user logged in"} as const
  let course = await prisma.courses.findUnique({
    where:{id: courseId},
    select: {
      status: true,
      name: true,
      category_id: true,
      maintainer_groupTodiscourse_groups: true,
      course_groupTodiscourse_groups: true,
      course_maintainers: {where: {maintainer: user.id}},
      course_cohorts: {
        select: {
          discourse_groups: true,
          name: true,
        }
      }
    }
  })
  if(!course || course.course_maintainers.length === 0) return {
    status: 403,
    result: `ERROR: user is not maintainer of course ${courseId}`
  } as const

  if(msg.description && msg.description.length > 200) return {status: 400, result: "ERROR: description must be less than 200 characters"} as const
  if(msg.name && msg.name.length > 50) return {status: 400, result: "ERROR: name must be less than 50 characters"} as const

  let slug: string | undefined
  if(msg.name) {
    slug = slugify(msg.name)
    await Promise.all([
      updateGroup(course.maintainer_groupTodiscourse_groups.id, slug+'-m'),
      updateCategory(course.category_id, {
        name: msg.name,
        slug: slug
      }),
      updateGroup(course.course_groupTodiscourse_groups.id, slug),
      ...course.course_cohorts.map(cohort => updateGroup(cohort.discourse_groups.id, slug+'-'+cohort.name))
    ])
  }

  let newData = await prisma.courses.update({
    where: {id: courseId},
    data: {
      slug,
      invite_only: msg.invite_only,
      cohort_max_size: msg.cohort_max_size,
      duration: msg.duration,
      status: msg.status,
      card_image: msg.card_image,
      prerequisites: msg.prerequisites,
      description: msg.description,
      cost: msg.cost,
      name: msg.name,
    }
  })

  return {status: 200, result: newData} as const
}

export const courseDataQuery = (id:number) => prisma.courses.findUnique({
  where: {id},
  include: {
    course_maintainers: {
      include: {
        people: {select: {display_name: true, username: true, link: true, bio: true}}
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
        cohort_facilitators: {
          select: {
            facilitator: true,
            people:{
              select:{
                display_name: true,
                username: true
              }
          }}
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
  let id = parseInt(req.query.id as string)
  if(Number.isNaN(id) ) return {status: 400, result: "ERROR: Course id is not a number"} as const
  let data = await courseDataQuery(id)

  if(!data) return {status: 403, result: `ERROR: no course with id ${id} found`} as const
  return {status:200, result: data} as const
}
