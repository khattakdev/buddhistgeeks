import h from 'react-hyperscript'
import { eventDataQuery, UpdateEventMsg, UpdateEventResult } from "pages/api/events/[id]"
import ErrorPage from 'pages/404'
import { InferGetStaticPropsType } from "next"
import { dateFromDateAndTimeInputs, getStripe, prettyDate, formHelper } from 'src/utils'
import { Box, FormBox, Seperator, Sidebar, TwoColumn } from 'components/Layout'
import {colors} from 'components/Tokens'
import Text from 'components/Text'
import { Primary, Secondary, Destructive } from 'components/Button'
import { useEventData, useUserData } from 'src/data'
import { PageLoader } from 'components/Loader'
import { useEffect, useState } from 'react'
import { EventForm } from 'pages/events/create'
import { Input } from 'components/Form'
import { useApi } from 'src/apiHelpers'
import { EventRSVPResult, EventRSVPMessage } from 'pages/api/events/[id]/rsvp'
import { useRouter } from 'next/router'
import { StickyWrapper } from 'components/Tabs'
import Link from 'next/link'
import { TwoColumnBanner } from 'components/Banner'
import Head from 'next/head'

type Props = InferGetStaticPropsType<typeof getStaticProps>
const EventPage = (props: Props)=> props.notFound ? h(ErrorPage) : h(EditableEvent, props)
export default EventPage

const EditableEvent = (props: Extract<Props, {notFound: false}>) => {
  let {data: user} = useUserData()
  let {data: event, mutate} = useEventData(props.id)
  let [editting, setEditting] = useState(false)

  let start_date = new Date(props.start_date)
  let end_date = new Date(props.end_date)

  let [edittedEvent, setEdittedEvent] =  useState({
    name: props.name,
    cost: props.standalone_events?.cost || 0,
    max_attendees: props.standalone_events?.max_attendees || 0,
    description: props.description,
    start_date: `${start_date.getFullYear()}-${('0'+(start_date.getMonth()+1)).slice(-2)}-${('0'+start_date.getDate()).slice(-2)}`,
    start_time: start_date.toLocaleTimeString([], {hour:"2-digit", minute: "2-digit", hour12: false}),
    end_time: end_date.toLocaleTimeString([], {hour:"2-digit", minute: "2-digit", hour12: false}),
    location: props.location,
  })
  useEffect(()=>{
    if(!event) return
    let start_date = new Date(event.start_date)
    let end_date = new Date(event.end_date)
    setEdittedEvent({
      name: event.name,
      cost: event.standalone_events?.cost || 0,
      max_attendees: event.standalone_events?.max_attendees || 0,
      description: event.description,
      start_date: `${start_date.getFullYear()}-${('0'+(start_date.getMonth()+1)).slice(-2)}-${('0'+start_date.getDate()).slice(-2)}`,
      start_time: start_date.toLocaleTimeString([], {hour:"2-digit", minute: "2-digit", hour12: false}),
      end_time: end_date.toLocaleTimeString([], {hour:"2-digit", minute: "2-digit", hour12: false}),
      location: event.location,
  })
  }, [event])
  let [status, callUpdateEvent] = useApi<UpdateEventMsg, UpdateEventResult>([])

  if(props === undefined|| !event) return h(PageLoader)
  if(!props.standalone_events) return h(ErrorPage)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    let start_date = dateFromDateAndTimeInputs(edittedEvent.start_date, edittedEvent.start_time).toISOString()
    let end_date =dateFromDateAndTimeInputs(edittedEvent.start_date, edittedEvent.end_time).toISOString()

    let res = await callUpdateEvent('/api/events/'+props.id, {data:{...edittedEvent, start_date, end_date}, type: 'standalone', })
    if(res.status===200 && res.result.type === 'standalone') {
      let {events, ...standalone_events} = res.result.data
      mutate({
        ...events,
        standalone_events,
        cohort_events: [],
      })
      setEditting(false)
    }
  }

  if(editting) return h(FormBox, {onSubmit}, [
    h('h1', "Edit Event"),
    h(EventForm, {onChange: setEdittedEvent, state:edittedEvent}),
    h('div', {style:{
      backgroundColor: colors.appBackground,
      position: 'sticky',
      bottom: '0',
      padding: '16px 0',
      margin: '-16px 0',
      width: '100%'
    }},[
      h(Box, {h:true, style:{justifyContent: 'right'}}, [
        h(Destructive, {onClick: ()=>setEditting(false)}, "Cancel"),
        h(Primary, {type: 'submit' ,status}, "Submit")
      ])
    ])
  ])
  return h('div', [
    user&&props.people.id === user.id ? h(Banner, {start_date: props.start_date, setEditting}) : null,
    h(Head, {children: [
      h('title', {key: "title"}, event.name),
      h('meta', {property:"og:title", content:event.name, key:"og:title"}),
      h('meta', {property: "og:description", content: event.description.slice(0, 140)+'...', key: "og:description"}),
      h('meta', {property: "og:image", content: 'https://hyperlink.academy/img/social-logo.png', key: "og:image"}),
      h('meta', {property: "twitter:card", content: "summary", key:"twitter:card"})
    ]}),
    h(Event, {
      notFound: false as false,
      ...event,
      facilitating: !!user && props.people.id === user.id,
      rsvpd: !!event.people_in_events.find(p=>user && p.person === user.id),
      mutate
    })
  ])
}


const Event = (props: Extract<Props, {notFound: false}> & {facilitating: boolean, rsvpd: boolean, mutate: ReturnType<typeof useEventData>["mutate"]}) => {
  if(!props.standalone_events) return h(ErrorPage)

  let emails = props.people_in_events
    .map(p=>p.people.email)
    .concat(props.no_account_rsvps.map(p=>p.email))

  return h(TwoColumn, [
    h(Box, {gap:32, width: 640}, [
      h('h1', props.name),
    ]),
    h(Box, {gap:32}, [
      h(Text, {source: props.description}),
      h(Seperator),
      h(Box, {}, [
        h('h2', `Facilitated by ${props.people.display_name || props.people.username}`),
        h(Text, {source: props.people.bio || ''}),

        h(Box, {h:true}, [
          h('h4', [`Attending `, h('span.textSecondary', props.standalone_events.max_attendees !== 0 ?
            `(${props.people_in_events.length + props.no_account_rsvps.length}/${props.standalone_events.max_attendees})` :
            `(${props.people_in_events.length + props.no_account_rsvps.length})`)]),
          !props.facilitating ? null : h('a', {
            href:`mailto:?bcc=${emails.join(',')}`
          }, 'email everyone')
        ]),
        ...props.people_in_events.map(person=>h(Box, {h:true, gap:4}, [
          h(Link, {
            href: '/people/[id]',
            as: `/people/${person.people.username}`
          }, [
            h('a', {className: 'notBlue'}, person.people.display_name || person.people.username),
          ]),
          person.people.pronouns ? h('span.textSecondary', {}, ` (${person.people.pronouns})`) : null
        ])),
        ...props.no_account_rsvps.map(person=>h(Box, {h:true, gap:4}, [
          person.name
        ]))
      ]),
    ]),

    h(Sidebar, [
      h(StickyWrapper, [
        h(Box, [
          h(Details, {
            ...props.standalone_events,
            attendees: props.people_in_events.length + props.no_account_rsvps.length,
            facilitating: props.facilitating,
            id: props.id,
            start_date: props.start_date,
            end_date: props.end_date,
            mutate: props.mutate,
            rsvpd: props.rsvpd,
            location: props.location
          }),
        ])
      ])
    ])
  ])
}

const Banner = (props:{start_date: string, setEditting: (b:boolean)=>void})=>{
  let start_date = new Date(props.start_date)
  if(start_date > new Date()) return h(TwoColumnBanner, {red: true}, [
    h('span', {style:{alignSelf: 'center'}}, "You're facilitating this event"),
    h(Secondary, {onClick: ()=>props.setEditting(true)}, "Edit Event")
  ])

  return h(TwoColumnBanner, {red: true}, [
    h('span', {style:{alignSelf: 'center'}}, `Congrats! You hosted this event on ${prettyDate(props.start_date)}. You can edit the description to add any artifacts.`),
    h(Secondary, {onClick: ()=>props.setEditting(true)}, "Edit Event")
  ])
}

type DetailsProps = {
  start_date: string,
  end_date: string,
  attendees: number,
  cost:number,
  mutate: ReturnType<typeof useEventData>['mutate'],
  max_attendees:number|null,
  id: number,
  rsvpd: boolean,
  location: string,
  facilitating: boolean,
}
const Details = (props:DetailsProps)=>{
  let start_date = new Date(props.start_date)
  let end_date = new Date(props.end_date)

  let start = start_date.toLocaleTimeString([], {hour12: true, minute: '2-digit', hour:'numeric'})
  let end = end_date.toLocaleTimeString([], {hour12: true, minute: '2-digit', hour:'numeric', timeZoneName: "short"})
  return h(Box,{style:{alignSelf: 'center'}}, [
    h('div', {style:{alignSelf:'center'}}, [
      h('h1', props.cost !== 0 ? `$${props.cost}` : "FREE"),
      h('h3',  `${start_date.toLocaleDateString([], {weekday: 'short'})} ${prettyDate(props.start_date)}`),
      h('h4.textSecondary', `@ ${start} - ${end}`),
    ]),
    h(JoinButton, props),
    !(props.rsvpd) && props.max_attendees ? h('b', `${props.attendees}/${props.max_attendees} spots filled`) : null,
  ])
}

const JoinButton = (props:DetailsProps)=>{
  let [status, callRSVP] = useApi<EventRSVPMessage, EventRSVPResult>([])
  let {data: user} = useUserData()
  let router=useRouter()

  let [formState, setFormState] = useState({email: '', name: ''})
  let form = formHelper(formState, setFormState)

  if(new Date(props.end_date) < new Date()) return h('p.big', "This event has concluded")
  if(props.max_attendees && props.attendees >= props.max_attendees) return h('p.big', "Sorry, this event is full!")

  if(props.rsvpd || props.facilitating) return h('a', {href: props.location}, h(Primary, "Join Event"))

  if(props.cost === 0 && !user) {
    if(status === 'success') return h('p.accentSuccess', "You're RSVP'd! Check your email for an event invite, and any updates")
    return h(FormBox, {onSubmit: async (e) => {
        e.preventDefault()
        let result = await callRSVP(`/api/events/${props.id}/rsvp`, {
          email: form.email.value,
          name: form.name.value
        })
        if(result.status === 200) props.mutate((data)=>{
          if(!data || !user) return data
          return {
            ...data,
            no_accounts_rsvps: [...data.no_account_rsvps, {name: form.name.value, email:''}]
          }
        })
      }}, [
        h(Input, {placeholder: "Your email", type: 'email', ...form.email}),
        h(Input, {placeholder: "Your name", ...form.name}),
        h(Box, {gap: 4, style:{justifySelf: 'right', textAlign: 'right'}}, [
        h(Primary, {
          status,
          type: 'submit',
        }, "RSVP"),
          h(Link, {href: `/login?redirect=${encodeURIComponent(router.asPath)}`}, h('a', 'or sign in'))
        ])
      ])
  }

  return h(Primary, {
      onClick: async ()=> {
        if(user === false) router.push('/login?redirect=' + encodeURIComponent(router.asPath))
        else {
          let result = await callRSVP(`/api/events/${props.id}/rsvp`)
          if(result.status===200) {
            if(result.result.enrolled) props.mutate((data)=>{
              if(!data || !user) return data
              return {...data, people_in_events:[{person: user.id, event: props.id, people:{username: user.username, display_name: user.display_name || '', pronouns: '', email:''}}]}

            })
            else  {
              let stripe = await getStripe()
              stripe?.redirectToCheckout({sessionId: result.result.sessionId})
            }
          }
        }
      }, status}, "RSVP")
}

export const getStaticProps = async (ctx:any)=>{
  let eventID = parseInt(ctx.params?.id as string)
  if(Number.isNaN(eventID)) return {props:{notFound:true}} as const
  let data = await eventDataQuery(eventID)

  if(!data || data.standalone_events===null) return {props: {notFound: true}} as const

  return {props: {notFound: false, ...data}, revalidate:1} as const
}

export const getStaticPaths = async ()=>{
  return {paths:[], fallback: true}
}
