import h from 'react-hyperscript'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { InferGetStaticPropsType } from 'next'
import styled from '@emotion/styled'


import CourseCard, {FlexGrid} from '../components/Course/CourseCard'
import {colors} from '../components/Tokens'
import { Box} from '../components/Layout'
// import { AccentImg } from '../components/Images'
import { useUserCohorts, useUserData, useCourses, useUserCourses } from '../src/data'
import { coursesQuery } from './api/get/[...item]'
import { BigCohortCard } from '../components/Card'
import {COPY} from './index'
import { useEffect } from 'react'
import { PageLoader } from '../components/Loader'

type Props = InferGetStaticPropsType<typeof getStaticProps>
const Dashboard = (props:Props) => {
  let {data: user} = useUserData()
  let {data: courses} = useCourses(props)
  let {data: cohorts} = useUserCohorts()
  let {data: userCourses} = useUserCourses()
  let router = useRouter()

  useEffect(() => {
    if(user === false) router.push('/')
  }, [user])

  if(!user || cohorts === undefined || userCourses === undefined) {
    return h(PageLoader)
  }

  return h(Box, {gap:48}, [
    h(Box, [
      h('h1', `Hello ${user.display_name || user.username}!`),
      h(Box, [
        h('span', {style:{color: 'blue'}}, [
          h(Link,{href: '/manual'}, h('a.mono', 'Read the manual')),
          h('span', {style: {fontSize: '1.25rem'}}, '\u00A0 ➭')
        ]),
        h('span', {style:{color: 'blue'}}, [
          h('a.mono', {href: 'https://forum.hyperlink.academy'}, 'Check out the forum'),
          h('span', {style: {fontSize: '1.25rem'}}, '\u00A0 ➭')
        ]),
      ])
    ]),


    //Your cohorts section 
    !cohorts ? null : h(Box, [
      h('h2', "Your Cohorts"),
      //if not enrolled in anything, throw empty
      cohorts.course_cohorts.length === 0 
      ? h(Box, {gap:16, style: {maxWidth: 400, textAlign: 'center', margin: 'auto'}}, [
        h( EmptyImg, {src: 'img/empty.png'}),
        h('small.textSecondary', "Hmmm... Looks like you haven't enolled in anything yet. Check out some available courses in the Course List below!" ),
      ])
      // if enrolled, show grid of enrolled cohorts
      : h(FlexGrid, {min: 250, mobileMin:250}, cohorts.course_cohorts.map(cohort => {
        let facilitating = cohort.facilitator === (user ? user.id: '')
        return h(BigCohortCard, {...cohort, enrolled: !facilitating, facilitating})
      }))
    ]),
    h('hr'),

    // Courses you maintain
    userCourses.maintaining_courses.length === 0 ? null :  h(Box, {}, [
      h('h2', 'Courses you maintain'),
      h(FlexGrid, {min: 328, mobileMin: 200}, userCourses.maintaining_courses.map(course=>{
        return h(CourseCard,{...course, start_date: ''})
      }))
    ]),

    !courses ? null : h(Box, {gap: 16}, [
      h('h2', COPY.coursesHeader),
      user.admin ? h('span', {style:{color: 'blue'}}, [
        h(Link,{href: '/courses/create'},  h('a.mono', 'Publish a New Course')),
        h('span', {style: {fontSize: '1.25rem'}}, '\u00A0 ➭')
      ]) : null,
      h(FlexGrid, {min: 328, mobileMin: 200},
        courses?.courses
        .map(course => {
          return h(CourseCard, {
            key: course.id,
            id: course.id,
            description: course.description,
            start_date: course.course_cohorts[0]?.start_date,
            name: course.name,
          }, [])
        })),
    ]),
    h(Box, { padding: 32, style:{backgroundColor: colors.grey95}}, [
      h(Box, {width: 640, ma: true}, [
        h('h2', COPY.courseGardenHeader),
        COPY.courseGardenDescription,
        h('span', {style:{color: 'blue', justifySelf: 'end'}}, [
          h('a.mono',{href: 'https://forum.hyperlink.academy/session/sso?return_path=/c/course-kindergarten/'},  COPY.courseGardenLink),
          h('span', {style: {fontSize: '1.25rem'}}, '\u00A0 ➭')
        ])
      ])
    ]),
  ])
}

export let EmptyImg = styled ('img') `
image-rendering: pixelated;
image-rendering: -moz-crisp-edges;
image-rendering: crisp-edges;
display: block;
margin: auto auto;
border: none;
height: 200px;
width: 200px;
`


export const getStaticProps = async () => {
  let courses = await coursesQuery()
  return {props: {courses}, unstable_revalidate: 1} as const
}


export default Dashboard
