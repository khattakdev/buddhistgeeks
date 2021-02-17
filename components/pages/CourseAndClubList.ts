import h from 'react-hyperscript'
import Link from 'next/link'
import { useCourses, Courses } from 'src/data'
import { Box, FlexGrid } from 'components/Layout'
import { colors, Mobile} from 'components/Tokens'
import { Primary } from 'components/Button'
import {WatchCourseInline} from 'components/Course/WatchCourse'
import { CourseCohortCard, ClubCohortCard} from 'components/Cards/CohortCard'
import styled from '@emotion/styled'
import { Pill } from 'components/Pill'
import { sortByDateAndName } from 'src/utils'

export function CourseAndClubList(props:{initialData:Courses, type: "club" | "course"}) {
  let {data: allCourses} = useCourses({initialData:props.initialData, type: props.type})

  let upcoming = allCourses?.courses
  .flatMap(course=>course.course_cohorts
    .filter(c=> course.cohort_max_size === 0 || course.cohort_max_size !==c.people_in_cohorts.length)
    .map(cohort=>{
      return {cohort, course}
    }))
    .sort(({cohort:a}, {cohort:b})=>sortByDateAndName(a, b))

  let [min, mobileMin] = props.type === 'club' ? [290, 290] : [400, 320]
  let CohortCardComponent = props.type === 'club' ? ClubCohortCard : CourseCohortCard

  return h(Box, {gap: 64} ,[
    // Header for Clubs
    props.type === 'club' ?h(Box, {width: 640}, [
      h(Box, {gap:16}, [
        h(Box, {gap:8}, [
          h('h1', "Clubs"),
          h('p.big', `Clubs are a lightweight way to convene people with shared interests to explore new things together.`),
        ]),
        h(Link, {href: "/forms/propose-club"}, h('a', {}, h(Primary, 'Propose a new Club!')))
      ]),
    ])
    // END Header for Clubs

    //Header for Courses 
      : h(Box, {width: 640}, [
        h(Box, {gap:16}, [
          h(Box, {gap:8}, [
            h('h1', "Courses"),
            h('p.big', `Courses are deep dives into a subject, led by a facilitator experienced in the field.`),
          ]),
          h(Link, {href: "/forms/propose-course"}, h('a', {}, h(Primary, 'Propose a new Course!')))
        ]), 
      ]),
    // END Header for Courses 

    // Upcoming Club or Course COHORTS
    h(Box, {gap: 16}, [
      h('h3.textSecondary', "Upcoming " + (props.type === 'club' ? "Clubs" : "Cohorts")),
      h(FlexGrid, {min , mobileMin},
        upcoming?.map(({cohort, course})=> {
          return h(CohortCardComponent, {...cohort, course})
        })),
    ]),
    // END Upcoming Club or Course COHORTS

    // All Courses or Clubs (Not Cohort)
    h(Box, {gap:32}, [
      h(Box, {gap:8}, [
        h('h3.textSecondary', `All ${props.type==='club' ? "Clubs" : "Courses"}`),
        h('p.textSecondary', {style:{maxWidth:640}}, [`If something looks interesting, `, h('b', `click the bell to get email updates`), ` when a new
  cohort is available AND inspire the facilitator to plan new cohorts`]),
      ]),
      h(FlexGrid, {min:290, mobileMin:290},
        allCourses?.courses
          .sort((a,b) => a.name > b.name ? 1 : -1)
          .map(course => {
            if(props.type==='club') return h(ClubListing, course)
            return h(CourseListing, course)
          })),
    ]),
    // END All Courses or Clubs (Not Cohort)
  ])
}

type ListingProps = {
  card_image: string,
  small_image: string,
  id: number,
  slug: string,
  description: string,
  name: string,
  status: "live" | "draft" | "archived"
}

// Club Listing Component (Not Cohort)
export const ClubListing = (props:ListingProps)=>{
  return h(CourseListingContainer, [
    h(CourseListingContent, [
      h(Link, {href:`/courses/${props.slug}/${props.id}`}, h('a',{}, 
        h(ClubHeaderImage, props.card_image.split(',').map(src=> h('img', {src, height: '32px', width: '32px'}))),
      )),
      h(Box, {gap:8}, [
        h(Link, {href:`/courses/${props.slug}/${props.id}`}, h('a', {style:{textDecoration:'none'}}, h('h3', props.name))),
        props.status === 'draft' ? h(Pill, {red:true}, 'draft') : null,
        h('p', props.description),
      ]),
      h(WatchCourseInline, {id: props.id})
    ]),
  ])
}

const ClubHeaderImage = styled("div")`
background-color: ${colors.accentLightBlue};
border: 1px solid;
border-color: ${colors.borderColor};
border-radius: 2px;
width: min-content;
display: grid;
grid-template-columns: repeat(3, min-content);
grid-gap: 16px;
padding: 8px;
`
//END Club Listing Component

//Course Listing Component (Not Cohort)
export const CourseListing = (props:ListingProps)=>{
  return h(CourseListingContainer, [
    h(CourseListingContent, [
      h(Link, {href:`/courses/${props.slug}/${props.id}`}, 
        h('a', {style:{margin:'auto auto'}}, h('img', {src: props.small_image, height: '128px', width: '128px', style:{border: `1px solid ${colors.textPrimary}`, borderRadius: '64px', boxSizing:"border-box"}}))
      ),
      h(Box, {gap:8}, [
        h(Link, {href:`/courses/${props.slug}/${props.id}`}, h('a', {style:{textDecoration:'none', textAlign:"center"}}, h('h3', props.name))),
        props.status === 'draft' ? h(Pill, {red:true}, 'draft') : null,
        h('p', props.description),
      ]),
      h(WatchCourseInline, {id: props.id}),
    ])
  ])
}


const CourseListingContainer = styled('div')`
border:1px solid ${colors.grey80};
border-radius: 4px;
box-sizing: border-box;
padding:16px;

${Mobile} {
  padding: 0 0 32px 0;
  border-top: none;
  border-left: none;
  border-right: none;
  border-bottom: 1px solid ${colors.grey80};
  border-radius: 0;

  :last-child {
    border-bottom: none;
  }
}

`

const CourseListingContent = styled('div')`
height: 100%;
display: grid;
grid-gap: 16px;
grid-template-rows: min-content auto min-content;
`
// END Course Listing 




