import h from 'react-hyperscript'
import Link from 'next/link'

import {colors, } from 'components/Tokens'
import {Box} from 'components/Layout'
import {Card} from '.'
import { Pill } from 'components/Pill'
import {prettyDate} from 'src/utils'

type Cohort = {
  name: string,
  start_date: string,
  people: {display_name?:string | null,
           username:string},
  completed?: string | null,
  live: boolean,
  enrolled?:boolean,
  facilitating?: boolean,
  id: number,
  courses: {
    name: string,
    slug: string
  }
  course: number,
}

export const SmallCohortCard = (props: Cohort) => {
  let started = new Date(props.start_date) < new Date()
  return h(Link, {
    href: "/courses/[slug]/[id]/cohorts/[cohortId]",
    as:`/courses/${props.courses.slug}/${props.course}/cohorts/${props.id}`,
    passHref: true,
  }, [
    h(Card, {style:{border: '1px solid', borderTop: '4px solid', borderRadius: '2px'}}, [
      h(Box, {gap: 8}, [
        props.enrolled || props.facilitating ? h(Box, {gap: 8, h: true}, [
          props.facilitating ? h(Pill, {borderOnly: true}, 'facilitator') : null,
          props.enrolled ? h(Pill, 'enrolled') : null,
          !props.live ? h(Pill, {red: true, borderOnly: true},'draft') : null
        ]): null,
        h('div', [
          h('h4', `${started ? "Started" : "Starts"} ${prettyDate(props.start_date)}`),
          h('p', {style:{color: colors.textSecondary}},
            `Facilitated by ${props.people.display_name || props.people.username}`)
        ])
      ])
    ])
  ])
}
