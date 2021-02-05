import h from 'react-hyperscript'
import Link from 'next/link'
import { Cohort, Course, User, useUserCohorts } from "src/data";
import { Box, TwoColumn, Sidebar, WhiteContainer, Seperator} from "components/Layout";
import { prettyDate } from 'src/utils';
import { StickyWrapper } from 'components/Tabs';
import Enroll from 'components/Course/Enroll';
import { EnrollButton } from 'components/Course/EnrollButton';
import {LinkButton, Secondary} from 'components/Button'
import { EmptyImg } from 'pages/dashboard';
import { CohortEvents } from './Events';
import { CreateEvent } from './CreateEvent';
import { CohortMembers } from 'pages/courses/[slug]/[id]/cohorts/[cohortId]';
import Text from 'components/Text'
import {colors} from 'components/Tokens'
import { useState } from 'react';
import { Info } from 'components/Form';
import { DISCOURSE_URL } from 'src/constants';

export function ClubPage(props:{
  cohort:Cohort,
  course: Course,
  curriculum: {
    text: string,
    id: string
  },
  user:User | undefined,
  mutate: (c:Cohort)=> void}) {
  let inCohort = props.cohort.people_in_cohorts.find(p => p.person === (props.user ? props.user.id : undefined))
  let isFacilitator  = !!props.user && props.cohort.people.username === props.user.username
  let isStarted = new Date() > new Date(props.cohort.start_date)
  let {data:userCohorts} = useUserCohorts()
  let [showDetails, setShowDetails] = useState(false)
  let invited = !!userCohorts?.invited_courses.find(course=>course.id === props.course.id )

  return h(Box, {gap:32}, [
    h(TwoColumn, [
      h('div', {style: {gridColumn: 1}}, [
        h(Box, {gap: 32}, [
          h(Box, {gap: 8}, [
            h(Box, {h: true}, props.course.card_image.split(',').map(src=>h('img', {src, style:{imageRendering: 'pixelated'}}))),
            h('h1', props.course.name),
            h('h2.textSecondary', props.cohort.completed
              ? `Completed ${prettyDate(props.cohort.completed)}`
              : `${isStarted ? "Started" : "Starts"} ${prettyDate(props.cohort.start_date)}`),
          ]),
          h('p.big', props.course.description),
          !inCohort && !isFacilitator ? null : h(Box, [
            h('a', {href: `${DISCOURSE_URL}/session/sso?return_path=/c/${props.cohort.category_id}`}
              , h(Secondary, 'Go to the Club forum')),
            !isFacilitator ? null : h(Link, {
              href: "/courses/[slug]/[id]/cohorts/[cohortId]/templates",
              as: `/courses/${props.cohort.courses.slug}/${props.cohort.courses.id}/cohorts/${props.cohort.id}/templates`
            }, h(Secondary, 'Forum Post from Template')),
          ]),
          h(Box, [
            h(LinkButton, {onClick: ()=>setShowDetails(!showDetails)}, showDetails ? "hide details" : "show details"),
            showDetails ? h('div', {style:{color: colors.textSecondary}}, [
              !isFacilitator ? null : h(Info, [
                `💡 You can make changes to the club description by editing `,
                h('a', {href: `${DISCOURSE_URL}/session/sso?return_path=/t/${props.curriculum.id}`}, `this topic`),
                ` in the forum`
              ]),
              h(Text, {source:props.curriculum?.text})
            ]) : null
          ]),
          inCohort || isStarted || isFacilitator ? null : h(EnrollButton, {id: props.cohort.id, course: props.course.id, max_size: props.course.cohort_max_size, learners: props.cohort.people_in_cohorts.length, invited: !props.course.invite_only || invited}, "Join this club")
        ])
      ]),
      h(Box, {gap: 32}, [
        h(Seperator),
        !isFacilitator && props.cohort.cohort_events.length === 0 ? null : h(Box, {gap:32}, [
          !isFacilitator && !inCohort ? null : h(CreateEvent, {
            cohort: props.cohort.id,
            people: [...props.cohort.people_in_cohorts.map(p=>p.people.username), props.cohort.people.username],
            mutate: (c)=>{
              props.mutate({...props.cohort, cohort_events: [...props.cohort.cohort_events, c]})
            }}),
          props.cohort.cohort_events.length === 0
            ? h(WhiteContainer, [
              h(Box, {gap:16, style: {maxWidth: 400, textAlign: 'center', margin: 'auto'}}, [
                h( EmptyImg, {src: '/img/empty.png'}),
                h('small.textSecondary', "Events are great for scheduling live calls or other important cohort dates. Learners can add these to their calendars. Looks like you haven't created any events yet. Hit the button above to schedule one!!" ),
              ])])
            : h(CohortEvents, {
              facilitating: isFacilitator,
              inCohort: !!inCohort,
              people:props.cohort.people_in_cohorts.map(p=>p.people.username),
              cohort: props.cohort.id,
              events: props.cohort.cohort_events,
              mutate: (events)=>{
                props.mutate({
                  ...props.cohort, cohort_events: events})
              },
              showCal: (inCohort || isFacilitator) && props.cohort.cohort_events.length > 0
            })
        ]),
        h(Seperator),
        h(CohortMembers, {cohort: props.cohort, isFacilitator, mutate:props.mutate})
      ]),
      h(Sidebar, [
        inCohort || isFacilitator ? null : h(StickyWrapper, [
          h(Box, {gap:32}, [
            h(Enroll, {course: props.course}),
            inCohort || isStarted || isFacilitator ? null : h(EnrollButton, {id: props.cohort.id, course: props.course.id, max_size: props.course.cohort_max_size, learners: props.cohort.people_in_cohorts.length, invited: !props.course.invite_only || invited}, "Join this club")
          ])
        ])
      ])
    ])
  ])
}
