import h from 'react-hyperscript'
import styled from '@emotion/styled'
import {Card} from '.'
import { colors } from 'components/Tokens'
import { Box, Seperator } from 'components/Layout'
import { prettyDate } from 'src/utils'
import Link from 'next/link'

export const EventCard = (props:{name: string, start_date: string, end_date: string, cost: number, id: number})=>{
  let start = new Date(props.start_date).toLocaleTimeString([], {hour12: true, minute: '2-digit', hour:'numeric'})
  let end = new Date(props.end_date).toLocaleTimeString([], {hour12: true, minute: '2-digit', hour:'numeric', timeZoneName: "short"})
  return h(Link, {href:`/events/${props.id}`, passHref: true}, h(Container, [
    h(EventCardHeader),
    h(Box, {padding:16, style:{border: '1px solid', borderTop: 'none', borderRadius: '2px'}}, [
      h(Box, {gap:8},[
        h('h3', props.name),
        h('span',  `${prettyDate(props.start_date)} @ ${start} - ${end}`),
      ]),
      new Date(props.start_date) < new Date() ? null : h(Box, {gap:8},[
        h(Seperator),
        h('span.textSecondary', `${props.cost === 0 ? "FREE" : '$'+props.cost}`)
      ])
    ]),
  ]))
}

let EventCardHeader = styled('div')`
background-color: ${colors.accentLightBlue};
height:8px;
border: 1px solid;
border-radius: 2px 2px 0px 0px;
`

let Container = styled(Card)`
border: none;
padding: 0px;
`
