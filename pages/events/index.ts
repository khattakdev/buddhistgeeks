import h from 'react-hyperscript'
import { InferGetStaticPropsType } from "next"
import { getPublicEventsQuery } from "pages/api/events"
import Link from 'next/link'
import { Box, FlexGrid } from 'components/Layout'
import {EventCard} from 'components/Cards/EventCard'

type Props = InferGetStaticPropsType<typeof getStaticProps>
export default function Events(props:Props) {
  let [pastEvents, upcomingEvents] = props.events
    .sort((a, b)=>{
      if(a.events.start_date === b.events.start_date) return a.events.name > b.events.name ? 1 : -1
      return a.events.start_date > b.events.start_date ?  1 : -1
    })
    .reduce((acc, event)=>{
      if(new Date(event.events.start_date) < new Date()) acc[0].push(event)
      else acc[1].push(event)
      return acc
  }, [[],[]] as Array<typeof props.events>)

  return h(Box, {gap:64}, [
    h('h1', "Upcoming Events"),
    h(FlexGrid, {min: 400, mobileMin: 300}, upcomingEvents.map(ev => h(Link, {passHref:true, href:`/events/${ev.event}`}, h(EventCard, {cost: ev.cost, ...ev.events})))),
    h(Box, {gap:32}, [
      h('h2', "Past Events"),
      h(FlexGrid, {min: 400, mobileMin: 300}, pastEvents.map(ev => h(Link, {passHref:true, href:`/events/${ev.event}`}, h(EventCard, {cost:ev.cost, ...ev.events}))))
    ])
  ])
}

export const getStaticProps = async () => {
  let events = await getPublicEventsQuery()
  return {props: {events}, revalidate: 1} as const
}
