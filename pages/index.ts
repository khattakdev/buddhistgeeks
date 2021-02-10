import h from 'react-hyperscript'
import styled from '@emotion/styled'
import { InferGetServerSidePropsType, GetServerSidePropsContext } from 'next'

import Intro from 'writing/Intro.mdx'
import { Mobile, Tablet} from 'components/Tokens'
import { Box, Body, FlexGrid} from 'components/Layout'
import { Primary, Secondary } from 'components/Button'
// import {TitleImg} from '../components/Images'
import { Courses, useCourses } from 'src/data'
import {getToken} from 'src/token'
import NewsletterSignup from 'components/NewsletterSignup'
import { coursesQuery } from 'pages/api/courses'
import { getPublicEventsQuery } from './api/events'
import Link from 'next/link'
import { EventCard } from 'components/Cards/EventCard'
import {CourseCohortCard, ClubCohortCard} from 'components/Cards/CohortCard'

let COPY = {
  hyperlinkTagline: "Hyperlink is a course platform and online school built for seriously effective learning.",
  registerHeader: "Calling all superlearners! Join the Hyperlink Alpha to propose a course idea, and (very soon!) enroll one of our first courses.",
  registerButton: "Browse the Courses",
  emailHeader: "Get updates about new courses and more!",
  emailDescription: "We'll never spam or share your email. You can unsubscribe at any time.",
  emailButton: "Get Updates",
  coursesHeader: "All Courses",
}

type Props = InferGetServerSidePropsType<typeof getServerSideProps>
const Landing = (props:Props) => {
  let {data: allCourses} = useCourses({initialData:props})
  let [courses, clubs] = (allCourses || props).courses
      .filter(course=> {
        return !!course.course_cohorts.filter(c=> course.cohort_max_size === 0 || course.cohort_max_size !==c.people_in_cohorts.length)[0]
      })
      .sort((a,b)=>{
        let upcomingCohortA = a.course_cohorts.filter(c=>new Date(c.start_date) > new Date())[0]
        let upcomingCohortB = b.course_cohorts.filter(c=>new Date(c.start_date) > new Date())[0]

        if(upcomingCohortA.start_date === upcomingCohortB.start_date) return a.name > b.name ? 1 : -1
        return new Date(upcomingCohortA.start_date) < new Date(upcomingCohortB?.start_date) ? -1 : 1
      })
      .reduce((acc, course)=>{
        acc[course.type === 'course' ? 0 : 1].push(course)
        return acc
      }, [[],[]] as Array<Courses["courses"]>)

  console.log(allCourses)

  console.log(props.events)
  return h(Box, {gap:48}, [
    h(Welcome),
    h(WhyHyperlink, {}, h(Body, {}, h(Intro))),
    !courses || courses.length === 0 ? null : h(Box, {gap: 48}, [
      h('h1', {id: 'courses'}, "Upcoming Courses"),
      h(FlexGrid, {min: 400, mobileMin: 320}, 
        courses.flatMap(course=>{
          return course.course_cohorts.map(cohort=>{
            return  h(CourseCohortCard, {...cohort, course})
          })
        }).slice(0, 4)
       ),
      h(Link, {href:"/courses"}, h('a', {style:{justifySelf:"right"}},  h(Secondary, 'see all courses')))
    ]),
    !clubs || clubs.length === 0 ? null : h(Box, {gap: 48}, [
      h('h1', "Upcoming Clubs"),
      h(FlexGrid, {min: 290, mobileMin: 290},
        clubs.flatMap(course=>{
          return course.course_cohorts.map(cohort=>{
            return  h(ClubCohortCard, {...cohort, course})
          })
        }).slice(0, 6)
       ),
      h(Link, {href:"/clubs"}, h('a', {style:{justifySelf:"right"}},  h(Secondary, 'see all clubs')))
    ]),
    props.events.length === 0 ? null : h(Box, {gap: 48}, [
      h('h1', "Upcoming Events"),
      h(FlexGrid,
        {min: 400, mobileMin: 300},
        props.events.map(ev => h(Link, {passHref:true, href:`/events/${ev.event}`}, h(EventCard, {cost:ev.cost, ...ev.events}))))
    ]),
    h(Link, {href:"/events"}, h('a', {style:{justifySelf:"right"}},  h(Secondary, 'see all events')))
  ])
}

const Welcome = () =>{
  return h(LandingContainer, [
    h(Box, {gap:16}, [
      h(Box, {gap:32}, [
      h(Title, ['hyperlink.', h('wbr'), 'academy']),
      h(Tagline, COPY.hyperlinkTagline),
      ]),
      h(CTAGrid, [
        h('a', {href:'#courses'}, h(Primary, {}, COPY.registerButton)),
        h(NewsletterSignup)
      ]),
    ]),
  ])
}

let WhyHyperlink = styled('div')`
background-color: #F0F7FA;
width: 100vw;
position: relative;
left: 50%;
right: 50%;
margin-left: -50vw;
margin-right: -50vw;
text-align: center;
`

export const getServerSideProps = async ({req,res}:GetServerSidePropsContext) => {
  let token = getToken(req)
  if(!token) {
    let courses = (await coursesQuery()).filter(course=>{
      return !!course.course_cohorts
        .filter(c=> (course.cohort_max_size === 0
          || course.cohort_max_size !==c.people_in_cohorts.length))[0]
    })
    let events = (await getPublicEventsQuery()).filter(event=>{
      return new Date(event.events.start_date) > new Date()
    }).slice(0, 3)
    return {props: {courses, events}} as const
  }

  res.writeHead(303, {Location: '/dashboard'})
  res.end()
  return {props:{courses:[], events:[]}}
}


const LandingContainer = styled('div')`
/* setting up the background image */
background-image: url('/img/landing.png');
background-repeat: no-repeat;
background-position: right center;
background-size: 75%;
image-rendering: pixelated;
image-rendering: crisp-edges;
height: 700px;

${Tablet} {
  height: auto;
  background-position: right 80px;
};


${Mobile}{
  background-position: center 104px;
  background-size: 280px;

};
`

/* Text Styling for Landing Content */
const Title = styled('h1')`
font-family: 'Roboto Mono', monospace;
font-size: 4rem;
text-decoration: none;
font-weight: bold;
color: blue;
z-index: 2;

${Tablet} {
  font-size: 2.625rem;  
}
`

const Tagline = styled('h3')`
z-index: 2;
width: 33%;

  ${Mobile} {
    padding-top: 176px;
    width: 100%;
  }
`

const CTAGrid = styled('div')`
  width: 25%;
  display: grid;
  grid-gap: 32px; 
  grid-template-rows: auto auto;

  ${Tablet}{
    width: 100%;
  }
`

export default Landing
