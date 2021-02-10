import h from 'react-hyperscript'
import { useUserData, useCourseData, Course } from 'src/data'
import {useFormData} from 'src/hooks'
import { PageLoader } from 'components/Loader'
import { Box, LabelBox, FormBox } from 'components/Layout'
import { Tabs } from 'components/Tabs'
import { AddCohort, CourseTemplates, Invites } from 'pages/courses/[slug]/[id]/settings'
import {Discounts} from './settings/Discounts'
import { prettyDate } from 'src/utils'
import { Info, Input, Textarea } from 'components/Form'
import Link from 'next/link'
import { useApi } from 'src/apiHelpers'
import {UpdateCourseMsg, UpdateCourseResponse} from 'pages/api/courses/[id]'
import { Destructive, Primary } from 'components/Button'
import { IconPicker } from 'components/IconPicker'
import {colors} from 'components/Tokens'
import { DISCOURSE_URL } from 'src/constants'

export function ClubSettings(props: {course: Course, curriculum: {id: string, text: string}}) {
  let {data: user} = useUserData()
  let {data: course, mutate} = useCourseData(props.course.id, props.course)

  if(!user || !course) return h(PageLoader)
  if(user && !course.course_maintainers.find(m=>user && m.maintainer === user.id)) return h('div', [
    h('h1', "You don't have permisison to view this page!")
  ])

  return h(Box, {gap:64, width: 640}, [
    h(Box, {gap: 16}, [
      h('h1', course.name),
      h('p.big', [
        `Find and edit all the information you need about your club here!   If there’s
something you want to do, but you can’t find it here, shoot us an email (`,
        h('a', {href: 'mailto:contact@hyperlink.academy'}, 'contact@hyperlink.academy'),
        `) and we’ll help you out.`
      ]),
    ]),
    h(Tabs, {
      tabs: {
        Cohorts: h(Cohorts, {course, mutate}),
        Invites: h(Invites, {course, mutate}),
        Details: h(Details, {course, mutate, curriculum: props.curriculum}),
        Discounts: h(Discounts, {course:course.id}),
        Templates: h(CourseTemplates, {course, mutate}),
      }})
  ])
}

function Cohorts(props: {course:Course, mutate:(c:Course)=>void}) {
  return h(Box, {}, [
    h('p.big', "Run a cohort of this club"),
    h(AddCohort, props),
    h('h1', "Cohorts"),
    props.course.course_cohorts.length !== 0  ? null : h(Info, `Create your first club cohort!`),
    ...props.course.course_cohorts.flatMap((cohort)=> {
      let started = new Date(cohort.start_date) < new Date()
      return h(Box, [
        h('h3', {}, h(Link, {href: `/courses/${props.course.slug}/${props.course.id}/cohorts/${cohort.id}`}, h('a', {style:{textDecoration: 'none'}},`${started ? "Started" : "Starts"} ${prettyDate(cohort.start_date)}`))),
        h('div', [
          h('p.textSecondary', `Cohort #${cohort.name}`),
          h('p.textSecondary', ["Facilitated by ", h(Link, {href: `/people/${cohort.people.username}`}, h('a', cohort.people.display_name || cohort.people.username))])
        ])
      ])
    })
  ])
}

function Details(props: {course:Course, mutate:(c:Course)=>void, curriculum: {id: string, text: string}}) {
  let {state, form, changed, setState, reset} = useFormData({
    name: props.course.name,
    cohort_max_size: props.course.cohort_max_size,
    description: props.course.description,
    card_image: props.course.card_image,
    prerequisites: props.course.prerequisites,
    cost: props.course.cost,
    duration: props.course.duration
  }, [props.course])
  let [status, callUpdateCourse] = useApi<UpdateCourseMsg, UpdateCourseResponse>([state])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    let res = await callUpdateCourse(`/api/courses/${props.course.id}`, {...state})
    if(res.status === 200) props.mutate({...props.course, ...res.result})
  }

  return h(FormBox, {onSubmit, gap:32, style:{width: 400}}, [
    h('h2', 'Edit Club Details'),
    h(Info, [
      `💡 You can make changes to the club description by editing `,
      h('a', {href: `${DISCOURSE_URL}/session/sso?return_path=/t/${props.curriculum.id}`}, `this topic`),
      ` in the forum`
    ]),
    h(LabelBox, {gap:8}, [
      h('h4', 'Club Name'),
      h(Input, {
        type: 'text',
        maxLength: 50,
        ...form.name
      }),
    ]),
    h(LabelBox, {gap:8}, [
      h('h4', 'Description'),
      h(Textarea, {
        maxLength: 200,
        ...form.description
      }),
    ]),
    h(Box,  [
      h("div", [
        h('h4', "Emojis"),
        h('small.textSecondary', "Select three emojis to describe your club! Repeats ok.")
      ]),
      h(IconPicker, {
        icons: state.card_image.split(','),
        setIcons: (icons:string[]) => {
          setState({...state, card_image: icons.join(',')})
        }
      })
    ]),
    h(LabelBox, {gap:8}, [
      h('h4', 'Cost (USD)'),
      h(Input, {
        type: 'number',
        ...form.cost
      })
    ]),
    h(LabelBox, {gap:8}, [
      h('div', [
        h('h4', "Cohort Size"),
        h('small.textSecondary', "How many learners can enroll in a cohort. Set to 0 for no limit.")
      ]),
      h(Input, {
        type: 'number',
        required: true,
        ...form.cohort_max_size
      })
    ]),
    h(LabelBox, {gap:8}, [
      h('h4', 'Prerequisites'),
      h(Textarea, form.prerequisites)
    ]),
    h(LabelBox, {gap:8}, [
      h('h4', 'Duration'),
      h(Input, form.duration)
    ]),
    h('div', {style:{
      backgroundColor: colors.appBackground,
      position: 'sticky',
      bottom: '0',
      padding: '16px 0',
      margin: '-16px 0',
      width: '100%'
    }}, [
      h(Box, {h: true, style: {justifyContent: 'right'}}, [
        h(Destructive, {type: 'reset', disabled: !changed, onClick: (e)=>{
          e.preventDefault()
          reset()
        }}, "Discard Changes"),
        h(Primary, {type: 'submit', disabled: !changed, status}, 'Save Changes')
      ])
    ])
  ])
}
