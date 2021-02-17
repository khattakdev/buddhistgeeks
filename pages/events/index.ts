import h from 'react-hyperscript'
import { InferGetStaticPropsType } from "next"
import { getPublicEventsQuery } from "pages/api/events"
import { Box, FlexGrid } from 'components/Layout'
import {EventCard} from 'components/Cards/EventCard'
import { sortByDateAndName } from 'src/utils'

type Props = InferGetStaticPropsType<typeof getStaticProps>
export default function Events(props:Props) {
  let [pastEvents, upcomingEvents] = props.events
    .sort((a, b)=>sortByDateAndName(a.events, b.events))
    .reduce((acc, event)=>{
      if(new Date(event.events.end_date) < new Date()) acc[0].push(event)
      else acc[1].push(event)
      return acc
  }, [[],[]] as Array<typeof props.events>)

  return h(Box, {gap:64}, [
    h('h1', "Upcoming Events"),
    h(FlexGrid, {min: 400, mobileMin: 300}, upcomingEvents.map(ev => h(EventCard, {cost: ev.cost, ...ev.events}))),
    h(Box, {gap:32}, [
      h('h2', "Past Events"),
      h(FlexGrid, {min: 400, mobileMin: 300}, pastEvents.map(ev => h(EventCard, {cost:ev.cost, ...ev.events})))
    ])
  ])
}

export const getStaticProps = async () => {
  let events = await getPublicEventsQuery()
  return {props: {events}, revalidate: 1} as const
}
