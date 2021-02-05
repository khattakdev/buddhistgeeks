import h from 'react-hyperscript'
import styled from '@emotion/styled'
import Text from './Text'
import {colors} from './Tokens'
import { useMediaQuery } from 'src/hooks'
import { useState } from 'react'
import { Box } from './Layout'
import { LinkButton } from './Button'

export default function EditorWithPreview(props:{height?: number, value: string, onChange: (e:React.ChangeEvent<HTMLTextAreaElement>)=>void}) {
  let mobile = useMediaQuery('(max-width:640px)')

  let [mode, setMode] = useState<'edit'|'preview'>('edit')
  if(mobile) return h(Box, {gap:4}, [
    h('div', {style:{justifySelf: 'right'}}, [
      mode === 'preview'
        ? h(LinkButton, {onClick: ()=>setMode('edit')}, 'edit')
        : h(LinkButton, {onClick: ()=>setMode('preview')}, 'preview'),
    ]),
    mode === 'preview'
      ? h(Preview, {}, h(Text, {source: props.value}))
      : h(Editor, props),
  ])
  return h(EditorPreviewContainer, [
    h(Editor, props),
    h(Preview, {height:props.height}, h(Text, {source: props.value}))
  ])
}
let EditorPreviewContainer = styled('div')`
display: grid;
max-width: 1200px;
grid-template-columns: 50% 50%;
`

let Editor = styled('textarea')<{height?:number}>`
box-sizing: border-box;
height: ${props=>props.height ? props.height : 512}px;
padding: 16px;
font-family: 'Lato', sans-serif;
border-color: ${colors.grey55} !important;
border: 1px solid;
border-radius: 2px 0 0 2px;
resize: none;
font-size: inherit;
line-height: inherit;
`

let Preview = styled('div')<{height?:number}>`
overflow: scroll;
box-sizing: border-box;
padding: 16px;
font-size: 16px;
height: ${props=>props.height ? props.height : 512}px;
background-color:${colors.accentPeach};
border-radius: 0 2px 2px 0;
`
