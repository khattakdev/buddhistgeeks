import {APIHandler, Request, ResultType} from 'src/apiHelpers'
import { PrismaClient } from '@prisma/client'
import { getToken } from 'src/token'
import { createGroup, createCategory, updateTopic, createTopic, updateCategory } from 'src/discourse'

let prisma = new PrismaClient()

export type CreateCohortMsg = {
  courseId: number,
  start: string,
  facilitators: string[],
}
export type CreateCohortResponse = ResultType<typeof handler>

export default APIHandler(handler)

async function handler (req: Request) {
  let msg = req.body as Partial<CreateCohortMsg>
  if(!msg.courseId || !msg.start ||
    !msg.facilitators) return {status: 400, result: "Error: invalid request, missing parameters"} as const

  let user = getToken(req)
  if(!user) return {status: 403, result: "Error: no user logged in"} as const
  let isUserMaintainer = await prisma.course_maintainers.findUnique({where: {
    course_maintainer: {
      course: msg.courseId,
      maintainer: user.id
    }
  }})
  if(!isUserMaintainer) {
    return {status: 403, result: "ERROR: user is not maintainer of course"} as const
  }

  let [course, facilitators] = await Promise.all([
    prisma.courses.findUnique({
      where: {id: msg.courseId},
      select: {
        description: true,
        slug: true,
        id: true,
        type: true,
        category_id: true,
        name: true,
        status: true,
        course_templates: true,
        course_groupTodiscourse_groups: true,
        maintainer_groupTodiscourse_groups: true,
        course_cohorts: {
          select: {discourse_groups: true}
        }
      },
    }),
    Promise.all(msg.facilitators.map(f=>prisma.people.findUnique({where:{id: f}, select:{username:true, id: true}})))
  ])
  if(!course) return {status: 400, result: "ERROR: no course found with that id"} as const
  for(let f in facilitators){
    if(!facilitators[f]) return {status:404, result: "ERROR: no user with username "+msg.facilitators[f]}
  }

  let groupName = course.slug + '-' + course.course_cohorts.length
  let group = await createGroup({
    name: groupName,
    visibility_level:2,
    owner_usernames: facilitators.map(f=>f?.username).join(','),
    mentionable_level: 3,
    messageable_level: 3
  })
  if(!group) return {status:500, result: "ERROR: unable to create group"} as const

  await updateCategory(course.category_id, {name: course.name, permissions: {
    // Make sure to keep any existing cohorts as well
    ...course.course_cohorts.reduce((acc, cohort) => {
      acc[cohort.discourse_groups.name] = 1
      return acc
    }, {} as {[i:string]:number}),
    [groupName]: 1,
    [course.maintainer_groupTodiscourse_groups.name]: 1,
    [course.course_groupTodiscourse_groups.name]: 1
  }})
  let category = await createCategory(groupName, {permissions: {[groupName]:1}, parent_category_id: course.category_id})
  if(!category) return {status: 500, result: "ERROR: Could not create cohort category"} as const

  await Promise.all(course.course_templates.map( async template => {
    if(!category) return
    if(template.type === 'prepopulated') {
      if(template.name === ('Notes') && course?.type === 'course') {
        return updateTopic(category.topic_url, {
          category_id: category.id,
          title: groupName + " Notes",
          raw: template.content,
          tags: ['note']
        }, facilitators[0]?.username)
      }
      if(template.name === "Getting Started" && course?.type === 'club') {
        return updateTopic(category.topic_url, {
          category_id: category.id,
          title: " Getting Started",
          raw: template.content,
          tags: ['getting-started']
        }, facilitators[0]?.username)
      }
      else {
        return createTopic({
          title: template.title,
          category: category.id,
          raw: template.content,
          tags: template.name === "Getting Started" ? ['getting-started'] : undefined,
        }, facilitators[0]?.username)
      }
    }
  }))

  let cohort = await prisma.course_cohorts.create({
    include: {
      people: {select: {display_name: true, username: true}},
      cohort_facilitators: {select:{facilitator: true, people: {select:{display_name: true, username: true}}}},
    },
    data: {
      name: course.course_cohorts.length.toString(),
      category_id: category.id,
      description: course.description,
      discourse_groups:{
        create:{
          id: group.basic_group.id,
          name: groupName
        }
      },
      start_date: msg.start,
      courses: {
        connect: {
          id: course.id
        }
      },
      cohort_facilitators: {
        create: facilitators.map(f=>{return {facilitator: f?.id || ''}})

      }
    }
  })

  return {status: 200, result: cohort} as const
}
