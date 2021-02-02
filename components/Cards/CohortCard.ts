import h from 'react-hyperscript'
import Link from 'next/link'
import {Card} from '.'
import styled from '@emotion/styled'
import { colors, Mobile } from 'components/Tokens'
import {Box} from 'components/Layout'
import {prettyDate} from 'src/utils'

type Props = {
  id: number,
  name: string,
  start_date: string,
  people_in_cohorts?: Array<object>,
  completed?: string | null,
  course:{
    id: number,
    slug: string,
    name: string,
    description: string
    cohort_max_size: number,
    card_image: string,
  }
}
export const CourseCohortCard = (props:Props) => {
  let spotsLeft = props.course.cohort_max_size === 0 || !props.people_in_cohorts ? null : props.course.cohort_max_size - props.people_in_cohorts.length
  return h(Link,{
    href:`/courses/${props.course.slug}/${props.course.id}/cohorts/${props.id}`
  }, h(Container, [
    h(ImageContainer, [
      h('img', {src: props.course.card_image}),
    ]),
    h(Content, [
      h(Box, {gap: 4}, [
        h('h3', props.course.name),
        h('h4.textSecondary', isNaN(parseInt(props.name)) ? props.name  :`Cohort #${props.name}` ),
      ]),
      h('p.textSecondary', props.course.description),
      h('span', [
        h('b', `${cohortPrettyDate(props.start_date, props.completed)} ${spotsLeft ? '| ' : ""}`),
        !!spotsLeft && h('span.accentSuccess', `${spotsLeft} spots left!`)
      ])
    ])
  ]))
}

let Content = styled('div')`
display: grid;
padding: 16px;
grid-gap: 16px;
grid-template-rows: min-content auto 22px;
height: 100%;
box-sizing: border-box;
`

let Container = styled(Card)`
padding: 0px;
display: grid;
border: 2px solid;
border-radius: 2px;
grid-template-columns: 132px auto;
max-height: 304px;
${Mobile} {
grid-template-columns: auto;
}
`

const ImageContainer = styled('div')`
width: auto;
height: 300px;
overflow: hidden;
object-fit: none;
border-right: 2px solid;
${Mobile} {
display: none;
}
`

export const ClubCohortCard = (props: Props) => {
  let spotsLeft = props.course.cohort_max_size === 0 || !props.people_in_cohorts ? null : props.course.cohort_max_size - props.people_in_cohorts.length
  return h(Link, {
    href: `/courses/${props.course.slug}/${props.id}`,
    passHref: true
  }, [
    h(ClubCardContainer, [
      h(Box, {style:{backgroundColor: colors.accentLightBlue, padding: '16px', height: '8.25rem'}}, [
        h(Box, {h: true}, props.course.card_image.split(',').map(src=> h('img', {src}))),
        h(Box,{gap:4},[
          h('h3', props.course.name),
          h('h4.textSecondary', isNaN(parseInt(props.name)) ? props.name  :`Cohort #${props.name}` ),
        ])
      ]),
      h(ClubCardContent, [
        h('p', props.course.description),
        h('div', [
          h('span', [
            h('b', `${cohortPrettyDate(props.start_date, props.completed)} ${spotsLeft ? '| ' : ""}`),
            !!spotsLeft && h('span.accentSuccess', `${spotsLeft} spots left!`)
          ])
        ])
      ]),
    ])
  ])
}

const ClubCardContent = styled('div')`
display: grid;
grid-template-rows: auto min-content;
height: 100%;
box-sizing: border-box;
grid-gap: 16px;
padding: 16px;
`

const ClubCardContainer = styled('a')`
max-width: 320px;
background-color: white;
border: 1px solid;
display: grid;
grid-template-rows: min-content auto;
border-color: ${colors.grey15};
text-decoration: none;

color: ${colors.textPrimary};

&:visited {
color: inherit;
}

&:hover, &:active, &:focus {
cursor: pointer;
transform: translate(-4px, -4px);
box-shadow: 4px 4px ${colors.grey15};
}
`

export const cohortPrettyDate = (start_date: string, completed?: string | null)=>{
  if(completed) return `${prettyDate(start_date)} - ${prettyDate(completed || '')}`
  if(new Date() > new Date(start_date)) return `Started ${prettyDate(start_date)}`
  return `Starts ${prettyDate(start_date)}`
}
