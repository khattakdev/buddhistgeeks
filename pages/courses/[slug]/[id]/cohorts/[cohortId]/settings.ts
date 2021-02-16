import h from 'react-hyperscript'
import { InferGetStaticPropsType } from "next"
import { cohortDataQuery, UpdateCohortMsg, UpdateCohortResponse } from "pages/api/cohorts/[cohortId]"
import { getTaggedPost } from "src/discourse"
import ErrorPage from 'pages/404'
import { Box, FormBox, LabelBox } from 'components/Layout'
import { PageLoader } from 'components/Loader'
import { Cohort, useCohortData, useUserData } from 'src/data'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { BackButton, Primary, Destructive } from 'components/Button'
import { Tabs } from 'components/Tabs'
import { Input, Textarea } from 'components/Form'
import { useFormData } from 'src/hooks'
import { useApi } from 'src/apiHelpers'
import { cohortName } from 'src/utils'

type Props = InferGetStaticPropsType<typeof getStaticProps>
export default function WrappedSettingsPage(props:Props) {return props.notFound ? h(ErrorPage) : h(CohortSettingsPage, props)}
const CohortSettingsPage= (props: Extract<Props, {notFound:false}>) => {
  let {data: user} = useUserData()
  let {data: cohort, mutate} = useCohortData(props.cohortId, props.cohort)
  let router = useRouter()
  useEffect(()=>{
    if(!props.cohort || user === undefined) return
    else if(user===false) router.push('/')
    else if(!props.cohort.cohort_facilitators.find(f=>user&&f.facilitator===user.id)) router.push('/dashboard')
  },[user, props.cohort])
  if(!cohort) return h(PageLoader)
  return h(Box, {gap:64}, [
    h(Box, [
      h(BackButton, {href:`/courses/${props.cohort.courses.slug}/${props.cohort.courses.id}/cohorts/${props.cohort.id}`}, "Cohort"),
      h('h1', "Cohort Settings"),
      h('h4', cohortName(cohort.name))
    ]),
    h(Tabs, {tabs: {
      Details: h(CohortDetails, {cohort, mutate}),
    }
    })
  ])
}

function CohortDetails(props:{cohort:Cohort, mutate:(c:Cohort)=>void}) {
  let start_date = new Date(props.cohort.start_date)
  let {state, form, reset, changed} = useFormData({
    name: props.cohort.name,
    description: props.cohort.description,
    start_date: `${start_date.getFullYear()}-${('0'+(start_date.getMonth()+1)).slice(-2)}-${('0'+start_date.getDate()).slice(-2)}`,
    start_time: start_date.toLocaleTimeString([], {hour:"2-digit", minute: "2-digit", hour12: false}),
  }, [props.cohort])

  let [status, callUpdateCohort] = useApi<UpdateCohortMsg, UpdateCohortResponse>([])

  const onSubmit = async (e:React.FormEvent)=>{
    e.preventDefault()

    let d1 = state.start_date.split('-').map(x=>parseInt(x))
    let t1 = state.start_time.split(':').map(x=>parseInt(x))
    let start_date = (new Date(d1[0], d1[1] -1, d1[2], t1[0], t1[1])).toISOString()
    let result = await callUpdateCohort(`/api/cohorts/${props.cohort.id}`, {data: {
      name: state.name,
      description: state.description,
      start_date
    }})
    if(result.status === 200) {
      props.mutate({...props.cohort, ...result.result})
    }
  }

  return h(FormBox, {width: 400, onSubmit}, [
    h(LabelBox, {gap: 8}, [
      h('h3', 'Cohort Name'),
      h(Input, {maxLength: 50, ...form.name})
    ]),
    h(LabelBox, {gap:8}, [
      h("div", [
        h('h4', 'Blurb'),
        h('small', 'Describe your cohort in one or two sentences. ')
      ]),
      h(Textarea, {maxLength: 200, ...form.description})
    ]),
    h(LabelBox, {gap:8}, [
      h('h4', "Start Date"),
      h(Box, {h: true},[
      h(Input, {type: "date", ...form.start_date}),
      h(Input, {type: "time", ...form.start_time})
      ])
    ]),
    h(Box, {h: true, style:{justifySelf:"right"}},[
      h(Destructive, {disabled: !changed, onClick: (e)=>{
        e.preventDefault()
        reset()
      }}, "Discard Changes"),
        h(Primary, {type: 'submit', disabled: !changed, status}, 'Save Changes')
    ])
  ])
}

export const getStaticProps = async (ctx:any)=>{
  let cohortId = parseInt(ctx.params?.cohortId as string || '')
  if(Number.isNaN(cohortId)) return {props:{notFound: true}} as const
  let cohort = await cohortDataQuery(cohortId)

  if(!cohort) return {props: {notFound: true}} as const

  let cohort_events = cohort.cohort_events
    .filter(c=>c.everyone)
    .map(event =>{
      return {...event, events: {...event.events, location: ''}}
  })

  let [notes] = await Promise.all([
    getTaggedPost(cohort.category_id, 'note'),
  ])
  return {
    props: {
      notFound: false,
      cohortId,
      cohort: {...cohort, cohort_events},
      notes,
    },
    revalidate: 1} as const
}

export const getStaticPaths = () => {
  return {paths:[], fallback: true}
}
