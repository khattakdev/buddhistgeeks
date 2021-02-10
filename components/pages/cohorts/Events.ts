import h from 'react-hyperscript'
import { getTimeBetween } from 'src/utils'
import { useState } from 'react'
import { Box, FormBox } from 'components/Layout'
import styled from '@emotion/styled'
import Link from 'next/link'
import { colors } from 'components/Tokens'
import {Calendar, Pencil} from 'components/Icons'
import { EventForm } from './CreateEvent'
import { SmallLinkButton, LinkButton, Primary, IconButton, Destructive } from 'components/Button'
import { useApi } from 'src/apiHelpers'
import { UpdateEventMsg, UpdateEventResult, DeleteEventResult } from 'pages/api/events/[id]'
import Text from 'components/Text'
import { Cohort, useUserData } from 'src/data'
import { Pill } from 'components/Pill'
import { useFormData } from 'src/hooks'

export const CohortEvents = (props: {
  facilitating: boolean,
  inCohort: boolean,
  cohort: number,
  people: string[],
  events:Cohort["cohort_events"],
  mutate: (E:Cohort["cohort_events"])=>void,
  showCal: boolean,
})=>{
  let {data:user} = useUserData()
  let pastEvents = props.events.filter((event)=>new Date() > new Date(event.events.end_date))
  let [showPastEvents, setShowPastEvents] = useState(pastEvents.length === props.events.length)

  let displayedEvents = props.events
        .filter((event)=>showPastEvents ? true : new Date() < new Date(event.events.end_date) )
        .sort((a, b) => new Date(a.events.start_date) > new Date(b.events.start_date) ? 1 : -1)
  return h(Box, [
    // (inCohort || isFacilitator) && cohort.cohort_events.length > 0 ? h(Link, {href: "/calendar"}, 
    h(Box, {h:true, gap:0, style: {gridTemplateColumns: 'auto min-content', gridGap:0}}, [

      pastEvents.length === 0 ? null : h(SmallLinkButton, {textSecondary: true, onClick: ()=>{
        setShowPastEvents(!showPastEvents)
      }}, showPastEvents ? "hide past events" : "show past events"),
      !props.showCal ? null :
        h(Link, {href: "/calendar"}, h(SmallLinkButton, {textSecondary: true, style:{justifySelf: 'end'}},
        h(Box, {h:true, gap:8, style:{textAlign:'right'}}, ['add to your calendar ', Calendar]),
      ))

    ]),

    h(TimelineContainer, {},
      displayedEvents
        .map((event,index) => h(Event, {
          user: user ? user.id : undefined,
          inCohort: props.inCohort,
          key: event.events.id,
          facilitating: props.facilitating,
          event,
          people: props.people,
          cohort: props.cohort,
          mutate: (newEvent) => {
            let events = props.events.slice(0)
            events[index] === newEvent
            return props.mutate(events)
          },
          mutateDelete: ()=>{
            let events = props.events.slice(0)
            events.splice(index, 1)
            return props.mutate(events)
          },
          first: showPastEvents ? index === pastEvents.length : index === 0,
          last: index === displayedEvents.length -1,
        }))
     )
  ])

}

const Event = (props: {
  event:Cohort["cohort_events"][0],
  user?: string,
  facilitating: boolean
  inCohort: boolean
  people: string[]
  cohort: number,
  last: boolean,
  first: boolean,
  mutate: (e:Cohort["cohort_events"][0])=>void,
  mutateDelete: ()=>void,
})=>{
  let [editting, setEditing] = useState(false)
  let [expanded, setExpanded] = useState(props.first)
  let event = props.event
  let start_date = new Date(event.events.start_date)
  let end_date = new Date(event.events.end_date)
  let past = end_date < new Date()

  let {state, setState} = useFormData({
    everyone: !event.everyone,
    name: event.events.name,
    location: event.events.location,
    description: event.events.description,
    start_date: `${start_date.getFullYear()}-${('0'+(start_date.getMonth()+1)).slice(-2)}-${('0'+start_date.getDate()).slice(-2)}`,
    start_time: start_date.toLocaleTimeString([], {hour:"2-digit", minute: "2-digit", hour12: false}),
    end_time: end_date.toLocaleTimeString([], {hour:"2-digit", minute: "2-digit", hour12: false}),
    people: event.events.people_in_events.map(p=>p.people.username)
  }, [event])

  let[status, callUpdateEvent] = useApi<UpdateEventMsg, UpdateEventResult>([props], async (event)=>{
    if(event.type === 'cohort') props.mutate(event.data)
    setEditing(false)
  })

  let [deleteStatus, callDeleteEvent] = useApi<null, DeleteEventResult>([], ()=>{
    setEditing(false)
    props.mutateDelete()
  })

  const onSubmit = (e: React.FormEvent)=>{
    e.preventDefault()
    let event = state

    let d1 = event.start_date.split('-').map(x=>parseInt(x))
    let t1 = event.start_time.split(':').map(x=>parseInt(x))
    let t2 = event.end_time.split(':').map(x=>parseInt(x))
    let start_date = new Date(d1[0], d1[1] -1, d1[2], t1[0], t1[1])
    let end_date = new Date(d1[0], d1[1] - 1, d1[2], t2[0], t2[1])

    callUpdateEvent('/api/events/'+props.event.events.id, {
      type: 'cohort',
      cohort: props.cohort,
      data: {
        name: event.name,
        description: event.description,
        location: event.location,
        start_date: start_date.toISOString(),
        end_date: end_date.toISOString(),
        people: event.people
      }
    })
  }

  return h(EventContainer, {last: props.last, selected: expanded}, [
    h(Dot, {selected: expanded, onClick: ()=>setExpanded(event.events.description === '' ? false : !expanded), past}),
    editting
      ? h(FormBox, {onSubmit}, [
      h(EventForm, {onChange: setState, state, people: props.people}),
      h(Box, {h: true, style:{justifySelf: "right", alignItems: "center"}}, [
        h(LinkButton, {textSecondary: true, onClick: ()=>setEditing(false)}, "cancel"),
        h(Destructive, {status: deleteStatus, onClick: (e)=>{
          e.preventDefault()
          callDeleteEvent('/api/events/'+props.event.events.id, null, "DELETE")
        }}, "Delete Event"),
        h(Primary, {type: 'submit', status}, "Save Changes")
      ])
    ])
      : h(Box, [
        h(Box, [
          h(Box, {gap: 8}, [
            h('p.textSecondary', {style: {color: past ? colors.grey55 : undefined}}, [
              h('b', {style:{fontWeight:"900"}}, start_date.toLocaleDateString([], {weekday: 'short', month: "short", day: "numeric"}).toUpperCase()),
              ' ' + start_date.toLocaleTimeString([], {hour: "numeric", minute: "2-digit", hour12: true, timeZoneName: 'short'}) +
                ` | ` + getTimeBetween(start_date, end_date) + ' hrs ',
              (()=>{
                if(event.everyone) return null
                switch(event.events.people_in_events.length) {
                  case 1: return h(Pill, {style:{alignSelf:"center"}}, "Solo")
                  case 2: return h(Pill, {style:{alignSelf:"center"}}, "1:1")
                  default: return h(Pill, {style:{alignSelf:"center"}}, "Group")
                }
              })()
            ]),
            h(Box, {h: true, style:{gridTemplateColumns:"auto auto min-content"}}, [
              h(EventTitle, {past, onClick: ()=>setExpanded(!expanded)}, [
                event.events.name
              ]),
              props.facilitating || props.user === event.events.created_by ? h(IconButton, {
                style: {alignSelf: 'baseline', justifySelf: 'right'},
                onClick: ()=>setEditing(true)
              }, Pencil) : null
            ]),
          ]),
          event.events.location && expanded ? h('a', {href: event.events.location}, h(Primary,  "Join Event")) : null,
        ]),
        !expanded || event.events.description === '' ? null
          : h(Box, [
            h('div', {
              style: {padding: '32px', backgroundColor: 'white', border: 'dotted 1px', overflow:'auto', overflowWrap: "break-word"}}, h(Text, {source: event.events.description})),
            event.events.people_in_events.length === 0 ? null : h('p.textSecondary', [h('b', 'Attendees: '), event.events.people_in_events.map(p=>p.people.display_name || p.people.username).join(', ')])
          ])
      ])
  ])
}

const Dot = styled('div')<{selected: boolean, past: boolean}>`
${p => {
let size = p.selected ? 24 : 16
return `
width: ${size}px;
height: ${size}px;
margin-right: ${p.selected ? 32 : 34}px;
`}}
box-sizing: border-box;
border: 4px solid;
background-color: white;
border-radius: 50%;

${p=>p.past ? `background-color: ${colors.grey80};` : ''}

&:hover {
cursor: pointer;
}
`

const EventTitle = styled('h3')<{past: boolean}>`
${p=>p.past ? `color: ${colors.textSecondary};` : ''}
&:hover {
cursor: pointer;
}
`
const TimelineContainer = styled('div')`
display: grid;
grid-gap: 32px;
border-left: 4px solid;
padding-left: 32px;
`

const EventContainer = styled('div')<{last?: boolean, selected: boolean}>`
box-sizing: border-box;
margin-left: -${p=>p.selected ? 46 : 42}px;
display: grid;
grid-template-columns: min-content auto;
max-width: 1024px;
${p=>p.last ? `background-color: ${colors.appBackground};` : ''}
`
