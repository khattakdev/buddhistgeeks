import h from 'react-hyperscript'
import styled from '@emotion/styled'
import {Card} from '.'
import { colors } from 'components/Tokens'
import { Box, Seperator } from 'components/Layout'
import { prettyDate } from 'src/utils'

export const EventCard = (props:{name: string, start_date: string, cost: number})=>{
  return h(Container, [
    h(EventCardHeader),
    h(Box, {padding:16, style:{border: '1px solid', borderTop: 'none', borderRadius: '2px'}}, [
      h(Box, {gap:8},[
        h('h3', props.name),
        h('span',  `${prettyDate(props.start_date)} @ ${(new Date(props.start_date)).toLocaleTimeString([], {hour12: true, minute: '2-digit', hour:'numeric', timeZoneName: "short"})}`),
      ]),
      new Date(props.start_date) < new Date() ? null : h(Box, {gap:8},[
        h(Seperator),
        h('span.textSecondary', `${props.cost === 0 ? "FREE" : '$'+props.cost}`)
      ])
    ]),

  ])
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
