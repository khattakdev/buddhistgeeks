import { ReactElement} from 'react'
import h from 'react-hyperscript'
import styled from '@emotion/styled'

import {Box} from './Layout'
import { Mobile, colors } from './Tokens'
import { useRouter } from 'next/router'

type Props = {
  tabs: {
    [key: string]: ReactElement | null
  }
}
export const Tabs = (props:Props) => {
  let router = useRouter()
  let tabs = Object.keys(props.tabs).filter(tab => props.tabs[tab] !== null)
  let selectedTab = typeof router.query.tab !== 'string' || !props.tabs[router.query.tab] ? tabs[0] : router.query.tab as string

  return h(Box, {gap: 32}, [
    h(StickyWrapper, [
      h(Nav, tabs.map(tab => h(Tab, {
        active: selectedTab === tab,
        onClick: ()=> {
          let route = new URL(window.location.href)
          route.searchParams.set('tab', tab)
          router.replace(route, undefined, {shallow: true})
        }
      }, tab))),
    ]),
    props.tabs[selectedTab]
  ])
}

export function VerticalTabs(props:{tabs: string[], selected: string, onChange: (tab: string)=>void}){
  return h(Box, {}, props.tabs.map((tab) => {
    return h(VerticalTab, {selected: props.selected === tab, onClick: ()=>props.onChange(tab)}, tab)
  }))
}

export const StickyWrapper = styled('div')`
position: sticky;
top: 0px;
background-color: ${colors.appBackground};
z-index: 1;

margin-top: -32px;
padding-top: 32px;

${Mobile} {
  padding-top: 16px;
  margin-top: -16px;
}
`

const Nav = styled('div')`
display: grid;
grid-gap: 32px;
grid-auto-columns: max-content;
grid-auto-flow: column;
grid-template-rows: auto;
border-bottom: 3px solid;

${Mobile} {
  grid-gap:16px;
}
`

const VerticalTab = styled('a')<{selected: boolean}>`
padding-left: 12px;
box-sizing: border-box;
&:hover {
cursor: pointer;
}
${p=>p.selected ? `
color: blue;
font-weight: bold;
border-collor: blue;
padding-left: 8px;
border-left: solid 4px;
` : ""}
`

const Tab = styled('h4')<{active:boolean}>`
padding-bottom: 4px;
margin-bottom: 2px;
font-weight: bold;
z-index: 8;

&:hover {
cursor: pointer;
}


${props => props.active ? 'color: blue' : ''};
${props => props.active ? 'border-bottom: 4px solid' : ''};
`.withComponent('a')
