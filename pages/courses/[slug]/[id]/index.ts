import h from 'react-hyperscript'
import { useState, ReactElement } from 'react'
import Link from 'next/link'
import { InferGetStaticPropsType } from 'next'
import styled from '@emotion/styled'

import { Box, Seperator, TwoColumn, Sidebar } from 'components/Layout'
import {Tabs, StickyWrapper} from 'components/Tabs'
import { colors } from 'components/Tokens'
import Loader, { PageLoader } from 'components/Loader'
import { Info } from 'components/Form'
import {Pill} from 'components/Pill'
import Enroll from 'components/Course/Enroll'
import Text from 'components/Text'
import {SmallCohortCard} from 'components/Cards/SmallCohortCard'
import {TwoColumnBanner} from 'components/Banner'
import {Modal} from 'components/Modal'
import { Primary, Destructive, LinkButton} from 'components/Button'
import {WatchCourse} from 'components/Course/WatchCourse'

import { DISCOURSE_URL, getTaggedPost } from 'src/discourse'
import { useUserData, useUserCohorts, useCourseData, Course, User} from 'src/data'
import { UpdateCourseMsg, UpdateCourseResponse} from 'pages/api/courses/[id]'
import { callApi } from 'src/apiHelpers'
import { cohortPrettyDate } from 'components/Cards/CohortCard'
import ErrorPage from 'pages/404'
import { courseDataQuery } from 'pages/api/courses/[id]'
import Head from 'next/head'
import { PrismaClient } from '@prisma/client'
import { prettyDate } from 'src/utils'
import { useRouter } from 'next/router'
import { useMediaQuery } from 'src/hooks'
import { AccentImg } from 'components/Images'
import { TodoList } from 'components/TodoList'

const COPY = {
  curriculumTab: "Curriculum",
  cohortTab: "All Cohorts",
  activeCohorts: "Your Current Cohorts",
  settings: "You can edit course details, create new cohorts, and more.",
  enrollButton: "Enroll in a cohort",
  updateCurriculum: (props: {id: string}) => h(Info, [
    `💡 You can make changes to the curriculum by editing `,
    h('a', {href: `${DISCOURSE_URL}/session/sso?return_path=/t/${props.id}`}, `this topic`),
    ` in the forum`
  ])
}

type Props = InferGetStaticPropsType<typeof getStaticProps>

const WrappedCoursePage = (props: Props)=>props.notFound ? h(ErrorPage) : h(CoursePage, props)
export default WrappedCoursePage

const CoursePage = (props:Extract<Props, {notFound: false}>) => {
  let {data: user} = useUserData()
  let {data:userCohorts} = useUserCohorts()
  let {data: course} = useCourseData(props.id, props.course || undefined)

  if(!course) return h(PageLoader)

  let activeCohorts = course?.course_cohorts.filter(i => {
    if(!user) return false
    return i.completed === null && (i.facilitator === user.id
      || i.people_in_cohorts
        .find(p => p.people.id === (user ? user.id : undefined)))
  }) || []

  let enrolled = activeCohorts.filter(i=>i.facilitator !== (user ? user.id : '')).length > 0
  let upcomingCohorts = course.course_cohorts.filter(c=> (new Date(c.start_date) > new Date()) && c.live)

  let isMaintainer = !!(course?.course_maintainers.find(maintainer => user && maintainer.maintainer === user.id))
  let invited = !!userCohorts?.invited_courses.find(course=>course.id === props.course.id )

  //Setting up the layout for the course page
  return h('div', [
    h(Head, {children: [
      h('meta', {property:"og:title", content:course.name, key:"og:title"}),
      h('meta', {property: "og:description", content: course.description, key: "og:description"}),
      h('meta', {property: "og:image", content: course.card_image.split(',')[0], key: "og:image"}),
      h('meta', {property: "twitter:card", content: "summary", key:"twitter:card"})
    ]}),
    h(Banners, {draft: course.status === 'draft', id: props.id, isMaintainer, slug: course.slug}),
    h(TwoColumn, [
      h(Box, {gap: 32}, [
        h(Box, {gap: 16}, [
          h('h1', course?.name),
        ]),
        h('p.big', course?.description || ''),

        upcomingCohorts.length > 0 && (activeCohorts.length === 0)
          ? h(Box, {padding: 32, style: {backgroundColor: colors.accentPeach}},[
            ...upcomingCohorts.flatMap(cohort=>{
              return [
                h(UpcomingCohort, {
                  ...cohort,
                  invite_only: course?.invite_only || false,
                  invited,
                  user,
                  learners_enrolled: cohort.people_in_cohorts.length,
                  cohort_max_size: course?.cohort_max_size || 0
                }),
                h(Seperator)]
            }).slice(0, -1)
          ])
          : activeCohorts.length === 0 ? null : h(Box, {padding: 32, style: {backgroundColor: colors.grey95}}, [
            h('h3', COPY.activeCohorts),
            ...activeCohorts.map(cohort=> h(SmallCohortCard, {
              ...cohort,
              courses: {
                name: course?.name || '',
                slug: course?.slug || '',
              },
              facilitating: cohort.facilitator === (user ? user?.id : undefined),
              enrolled: !(cohort.facilitator === (user ? user?.id : undefined))
            }))
          ]),
      ]),
      h(Tabs, {tabs: {
        [COPY.curriculumTab]:  h(Box, [
          isMaintainer ? h(COPY.updateCurriculum, {id: props.content.id}) : null,
          h(Text, {source: props.content.text})
        ]),
        [COPY.cohortTab]: h(Cohorts,{cohorts: course.course_cohorts, slug: course.slug, user: user ? user.id : '', invited, cohort_max_size: course?.cohort_max_size || 0}),
        Facilitators: h(Box, {gap:32}, course.course_maintainers.map(maintainer=>{
          return h(Box, {}, [
            h('h3', maintainer.people.display_name || maintainer.people.username),
            !maintainer.people.link ? null : h('a', {href: maintainer.people.link}, h('b', maintainer.people.link)),
            !maintainer.people.bio ? null : h(Box, {width: 640}, h(Text, {source: maintainer.people.bio}))
          ])
        }))
      }}),
      h(Sidebar, [
        h(StickyWrapper, [
          h(Enroll, {course}, [
            h(Box, [
              h(EnrollStatus, {
                courseId: course.id,
                courseSlug: course.slug,
                draft:course.status==='draft',
                maintainer: isMaintainer,
                inviteOnly:course.invite_only,
                invited,
                loggedIn: !!user,
                enrolled,
                upcoming:upcomingCohorts.length !== 0,
              }),
              h(Seperator),
              !isMaintainer ? h(WatchCourse, {id: course.id}) : h(Box, [
                h(Box, {gap:8}, [
                  h('h3', "You maintain this course"),
                  h('p.textSecondary', COPY.settings),
                ]),
                h(Link, {href:'/courses/[slug]/[id]/settings', as:`/courses/${course.slug}/${course.id}/settings`}, h(Destructive, 'Edit Course Settings'))
              ])
            ])
          ])]),
      ])
    ])
  ])
}

function UpcomingCohort(props: {
  people:{username: string, display_name: string | null},
  cohort_max_size: number,
  invite_only: boolean,
  learners_enrolled: number,
  course: number,
  id: number,
  invited: boolean,
  start_date: string,
  user?: User
}) {
  let router = useRouter()
  let mobile = useMediaQuery('(max-width:420px)')

  return h(Box, {h: !mobile, style:{gridAutoColumns: 'auto'}}, [
    h(Box, {gap: 4}, [
      h(Link, {href:`/courses/${router.query.slug}/${props.course}/cohorts/${props.id}`},
        h('a.notBlue', {style:{textDecoration: 'none'}}, h('h3', 'Starts ' + prettyDate(props.start_date)))),
      h('span', [
        'Facilitated by ',
        h(Link, {
          href:'/people/[username]',
          as:`/people/${props.people.username}`
        }, h('a.notBlue', {style: {textDecoration: 'underline'}},
             props.people.display_name || props.people.username)),
      ]),
      props.cohort_max_size === 0 ? null : props.cohort_max_size > props.learners_enrolled
        ? h('span.accentSuccess', `${props.cohort_max_size - props.learners_enrolled} ${props.cohort_max_size - props.learners_enrolled === 1 ? 'spot' : 'spots'} left!`)
        : h('span.accentRed', `Sorry! This cohort is full.`)
    ]),
    h(Box, {gap:8, style: {justifySelf: mobile ? 'left' : 'right', textAlign: mobile ? 'left' : 'right', alignContent: 'center'}}, [
      (props.cohort_max_size !== 0 && props.cohort_max_size  === props.learners_enrolled) ? null : h(Link, {
        href: '/courses/[slug]/[id]/cohorts/[cohortId]',
        as: `/courses/${router.query.slug}/${props.course}/cohorts/${props.id}`
      }, h('a', {}, h(Primary, 'See schedule')))
    ])
  ])
}


function EnrollStatus (props: {
  draft:boolean,
  maintainer:boolean,
  inviteOnly:boolean,
  invited:boolean,
  loggedIn:boolean,
  enrolled:boolean;
  upcoming:boolean;
  courseId:number;
  courseSlug:string
}) {
  if (props.draft) {
    if (props.maintainer) return h('span.accentRed', "Learners can't enroll in this course until you publish it!")
    return h('span.accentRed', "This course is still a draft. You can enroll once the creator publishes it!")
  }

  if (props.enrolled){
    if (props.upcoming) return h('span.accentSuccess', "You're enrolled in an upcoming cohort of this course. Feel free to enroll in another one though!")
    return  h('span.accentSuccess', "You're enrolled in an upcoming cohort of this course.")
  }

  if (!props.upcoming) {
    if(props.maintainer) return h('span.accentRed', [
      "Looks like there aren't any cohorts of this course planned. Create one ", h(Link, {href: "/courses/[slug]/[id]/settings", as: `/courses/${props.courseSlug}/${props.courseId}/settings`}, h('a', 'here')), '.'
    ])
    return h('span.accentRed', "Looks like there aren't any cohorts of this course planned :(")
  }

  if (props.inviteOnly) {
    if (props.maintainer) return h('span.accentRed', [
      "Learners need to be invited to enroll. Invite someone ", h(Link, {href: `/courses/${props.courseSlug}/${props.courseId}/settings`}, h('a', 'here')), '.'])
    if(props.invited) return h('span.accentSuccess', "You're invited!")
    if(props.loggedIn) return h('div', {}, h('span.accentRed', "This course is invite only. Reach out to the facilitators if you're interested!"))
    return h('div', {}, h('span.accentRed', "This course is invite only. If you've been invited, please log in."))
  }
  return null
}


const Cohorts = (props:{cohorts: Course['course_cohorts'], user: string, slug: string, cohort_max_size: number, invited:boolean}) => {
  let [pastCohorts, upcomingCohorts] = props.cohorts
  .filter(c=>{
    if(c.live) return true
    return c.facilitator === props.user
  }).sort((a, b) => new Date(a.start_date) > new Date(b.start_date) ? 1 : -1)
    .reduce((acc, cohort)=>{
      let enrolled = !!cohort.people_in_cohorts.find(p => p.people.id === props.user)
      let facilitating = cohort.facilitator=== props.user
      acc[new Date(cohort.start_date)< new Date() ? 0 : 1].push(
        h(Cohort, {cohort: {...cohort, enrolled, facilitating}, slug: props.slug, cohort_max_size: props.cohort_max_size, invited: props.invited})
      )
      return acc
    },[[],[]] as Array<Array<ReactElement>>)

  return h(Box, {gap:32}, [
    upcomingCohorts.length === 0 ? null : h('h2', "Upcoming Cohorts"),
    ...upcomingCohorts,
    upcomingCohorts.length === 0 || pastCohorts.length === 0 ? null : h(Seperator),
    pastCohorts.length === 0 ? null : h('h2', 'Ongoing and Past Cohorts'),
    ...pastCohorts
    ])
}

const Cohort = (props: {cohort: Course['course_cohorts'][0] & {facilitating?: boolean, enrolled?: boolean},slug:string, cohort_max_size: number, invited: boolean}) => {
  let id= props.cohort.id
  let router = useRouter()
  let past = new Date(props.cohort.start_date) < new Date()

  return h(Box, {h: true, style:{gridAutoColumns:'auto'}}, [
    h(Box, {gap: 4}, [
      !props.cohort.enrolled && !props.cohort.facilitating ? null : h('div', [
        props.cohort.enrolled ? h(Pill, 'enrolled') : null,
        ' ',
        props.cohort.facilitating ? h(Pill, {borderOnly: true}, 'facilitating') : null,
        ' ',
        !props.cohort.live ? h(Pill, {borderOnly: true, red: true}, 'draft') : null,
      ]),
      h('h3', {}, h(Link, {
        href:'/courses/[slug]/[id]/cohorts/[cohortId]',
        as:  `/courses/${props.slug}/${props.cohort.course}/cohorts/${id}`
      }, h('a', {style: {textDecoration: 'none'}}, `#${props.cohort.name} ${props.cohort.courses.name}`))),
      h(Box, {style: {color: colors.textSecondary}, gap: 4}, [
        h('strong', cohortPrettyDate(props.cohort.start_date, props.cohort.completed)),
        h('div', [`Facilitated by `,  h(Link, {href:`/people/${props.cohort.people.username}`}, h('a', props.cohort.people.display_name || props.cohort.people.username))])
      ]),
      props.cohort_max_size === 0 || props.cohort.completed ? null : props.cohort_max_size > props.cohort.people_in_cohorts.length
        ? h('span.accentSuccess', `${props.cohort_max_size - props.cohort.people_in_cohorts.length} ${props.cohort_max_size - props.cohort.people_in_cohorts.length === 1 ? 'spot' : 'spots'} left!`)
        : h('span.accentRed', `Sorry! This cohort is full.`)
    ]),
    past || props.cohort.enrolled || props.cohort.facilitating ? null : h(Box, {gap:8, style: {alignItems: 'center', alignContent: 'center', justifySelf: 'right', textAlign: 'right'}}, [
      h(Link, {
        href: `/courses/${router.query.slug}/${props.cohort.course}/cohorts/${props.cohort.id}`
      }, h('a', {}, h(Primary, 'See schedule')))
    ])
  ])
}
//feature to add a new cohort to a course
function MarkCourseLive(props: {id:number, slug: string}) {
  let {data:course, mutate} = useCourseData(props.id)
  let [state, setState] = useState<'normal'|'confirm'|'loading'|'complete'>('normal')

  const onClick = async (e: React.MouseEvent)  =>{
    e.preventDefault()
    if(!course) return
    setState('loading')
    let res = await callApi<UpdateCourseMsg, UpdateCourseResponse>(`/api/courses/${props.id}`, {status: 'live'})
    if(res.status===200){
      setState('normal')
      mutate({...course, status: 'live'})
    }
  }

  if(state === 'confirm' || state === 'loading') return h(Modal, {display: true, closeText:"nevermind", onExit: ()=>setState('normal')},[
    h(Box, {gap: 32}, [
      h('h2', {style:{textAlign:'center'}}, "Are you sure?"),
      h(Box, {gap: 16}, [
        "Before going live please check that you've done these things",
        h(Box.withComponent('ul'), {gap:16}, [
          h('li', [
            "Edit important details in ", h('a', {href: `https://hyperlink.academy/courses/${props.slug}/${props.id}/settings?tab=Details`}, "course settings"), "."
          ]),
          h('li', [
            "Written a ", h('a', {href: `${DISCOURSE_URL}/session/sso?return_path=/t/${props.id}`}, "curriculum"), "."
          ]),
        ]),
          h(Primary, {style:{justifySelf:'center'}, onClick}, state === 'loading' ? h(Loader) : 'Go Live!')        
      ])
    ])
  ])

  return h(Primary, {onClick: async e => {
    e.preventDefault()
    setState('confirm')
  }}, "Publish!")
}

// Feature to edit course detail (length, prereqs, one line description)



// Define Banners
const Banners = (props:{draft: boolean, id: number, slug:string, isMaintainer: boolean}) => {
  if(props.draft && props.isMaintainer) {
    if(props.isMaintainer){
      return h(TODOBanner, props)
    }
    return h(TwoColumnBanner, {red: true}, h(Box, {gap:16},[
      h(Box, {gap:16}, [
        h('h3', "This course isn't live yet!"),
        h('p',[`The maintainer is still working on getting this course in shape. Let them know
if you have any feedback!`])
      ])
    ]))
  }
  return null
}

// Draft Course ToDo Banner
const TODOBanner = (props:{
  id:number
  slug:string
}) => {
  let [expanded, setExpanded] = useState(false)

  return h(TwoColumnBanner, {red: true}, [
    h(BannerContent, [
      h(AccentImg, {height:32, width:36, src:"https://hyperlink-data.nyc3.cdn.digitaloceanspaces.com/icons/Seedling.png"}),
      h(Box, {gap:8}, [
        h('h4', "This course is still a draft"),
        h('p', 'It’s hidden from public view. People can’t see this page until you publish it.')
      ]),
      ... !expanded ? [] : [
        h(AccentImg, {height:32, width:36, src:"https://hyperlink-data.nyc3.cdn.digitaloceanspaces.com/icons/Bud.png"}),
        h(Box, {gap:16}, [
          h('h4', "Before you publish this course make sure that you ...  "),
          h(TodoList, {
            persistKey: "course-creation-todo",
            items: [
              h("span", [
                "Edit important details, like description and price, in ", h('a', {href: `https://hyperlink.academy/courses/${props.slug}/${props.id}/settings?tab=Details`}, "course settings"), "."
              ]),
              h("span", [
                "Write a comprehensive curriculum for your course, by editing the ", h('a', {href: `${DISCOURSE_URL}/session/sso?return_path=/t/${props.id}`}, "Curriculum topic"), " in the forum."
              ]),
              h("span", [
                "Create or edit ", h('a', {href: `https://hyperlink.academy/courses/${props.slug}/${props.id}/settings?tab=Templates`}, "templates"), " for reusable forum topics so you don't need to rewrite them for every cohort you run (or you can add these later)."
              ]),
              h("span", [
                "Create your first cohort, in ", h('a', {href: `https://hyperlink.academy/courses/${props.slug}/${props.id}/settings?tab=Cohorts`}, "course settings"), ". It will also be a draft that you need to edit before publishing. We'll guide you through it!"
              ])
            ]
          })
        ]),
        h(AccentImg, {height:32, width:36, src:"https://hyperlink-data.nyc3.cdn.digitaloceanspaces.com/icons/Flower.png"}),
        h(Box, {gap:16}, [
          h('h4', "Once you're ready, you can publish it here!"),
          h(MarkCourseLive, props)
        ])
      ]
    ]),
    h(LinkButton, {style:{justifySelf: 'right', textDecoration: 'none'}, onClick: ()=>setExpanded(!expanded)}, expanded ? "hide checklist" : "show checklist")
  ])
}

export const getStaticProps = async (ctx:any) => {
  let id = parseInt(ctx.params?.id as string || '' )
  if(Number.isNaN(id)) return {props: {notFound: true}} as const

  let data = await courseDataQuery(id)
  if(!data) return {props:{notFound: true}} as const
  let content = await getTaggedPost(data.category_id, 'curriculum')

  return {props: {notFound: false, content, id, course: data}, revalidate: 1} as const
}

export const getStaticPaths = async () => {
  let prisma = new PrismaClient()
  let courses = await prisma.courses.findMany({select:{id: true, slug: true}})
  return {paths:courses.map(course=>{
    return {params: {id: course.id.toString(), slug: course.slug}}
  }), fallback: true}
}


const BannerContent = styled('div') `
display: grid; 
grid-template-columns: min-content auto;
grid-column-gap: 16px;
grid-row-gap: 32px;
`
