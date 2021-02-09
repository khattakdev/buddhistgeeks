import styled from '@emotion/styled'
import h from 'react-hyperscript'
import { forwardRef } from 'react'
import {colors} from './Tokens'
import { Box } from './Layout'
import { useState } from 'react'

export let CheckBox = styled('label')`
display: grid;
align-items: center;
grid-template-columns: 16px auto;
grid-gap: 16px;


input[type="checkbox"]:focus {
  border: 1px solid;
  outline: none;
}

input[type="checkbox"]:hover {
  border: 2px solid;
}

input[type="checkbox"] {
  background-color: white;
  appearance: none;
  position: relative;
  padding: 0;
  /* margin: 0; */
  height: 16px;
  width: 16px;
  border: 1px solid;
  border-radius: 2px;
  align-self: first baseline;

}
input[type="checkbox"]::before {
  position: absolute;

  content: url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8'
  fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 4.69231L2.875
  7L7 1' stroke='black' stroke-width='2' stroke-linecap='round'
  stroke-linejoin='round'/%3E%3C/svg%3E");

  visibility: hidden; top: -5.5px;
  left: 2px;
}

input[type="checkbox"]:checked::before {
  visibility: visible;
}
input[type="checkbox"]:checked {
  border: 2px solid;
}
`

export function PasswordInput(props:Exclude<Parameters<typeof Input>[0], 'type'>) {
  let [visible, setVisible] = useState(false)
  return h('div', {style: {width: '100%', marginBottom: '-16px'}}, [
    h(Input, {
      ...props,
      type: visible ? "text" : 'password',
      style: {width: '100%', boxSizing:'border-box'}
    }),
    h(ToggleButton, {onClick: (e)=>{
      e.preventDefault()
      setVisible(!visible)
    }}, visible ? 'hide' : 'show')
  ])
}

let ToggleButton = styled('button')`
font-family: 'Roboto Mono', monospace;
color: ${colors.textSecondary};
outline: none;
background-color: inherit;
border: none;
position: relative;
&:hover {
cursor: pointer;
}
top: -30px;
left: -16px;
float: right;
`

let StyledInput = styled('input')<{readOnly?:boolean}>`
min-width: 0;
padding: 12px 16px;
border: 1px solid;
border-color: ${colors.grey55};
border-radius: 2px;
font-size: inherit;
font-family: inherit;
${p=>p.readOnly ? `
border: none;
background-color: ${colors.grey95};

&:focus {
outline: none;
}
`: ''}
`

export const Input = forwardRef<HTMLInputElement, Parameters<typeof StyledInput>[0]>((props, ref) => {
  if(!props.maxLength || typeof props.value !== 'string') return h(StyledInput, {...props, ref})

  let placeholder: string | undefined
  if(props.type === 'date') placeholder = 'yyyy-mm-dd'
  if(props.type === 'time') placeholder = '23:59'

  return h(Box, {gap: 4}, [
    h(StyledInput, {
      ...props,
      ref,
      placeholder: placeholder || props.placeholder
    }),
    h('small.textSecondary', {style:{justifySelf: 'right'}}, `${props.value.length}/${props.maxLength}`)
  ])
})

const StyledTextarea = styled('textarea')`
resize: vertical;
padding: 12px 16px;
border: 1px solid;
border-color: ${colors.grey55};
border-radius: 2px;
padding: 12px 16px;
font-size: 1rem;
height: 128px;
font-family: Lato;
border-radius: 2px;
`

export const Textarea = forwardRef<HTMLTextAreaElement, Parameters<typeof StyledTextarea>[0]>((props, ref ) => {
  if(!props.maxLength || typeof props.value !== 'string') return h(StyledTextarea, {...props, ref})
  return h(Box, {gap:4}, [
    h(StyledTextarea, {...props, ref}),
    h('small.textSecondary', {style:{justifySelf: 'right'}}, `${props.value.length}/${props.maxLength}`)
  ])
})

export const Error = styled('div')`
background-color: ${colors.backgroundRed};
color: ${colors.accentRed};
padding: 16px;
`

export const Info = styled('div')`
background-color: ${colors.accentPeach};
padding: 16px;
`

export const Select = (props: Parameters<typeof SelectEl>[0])=>{
  return h(Container, {},[
    h(SelectEl, props),
    h(Icon, {width: 18, height: 11, xmlns:"http://www.w3.org/2000/svg", fill: 'none'},
      h('path', {d: "M1 1L9 9L17 1", stroke:colors.textSecondary, strokeWidth: 2}))
  ])
}

export function Radio<T extends readonly {value:string, component:React.ReactElement, }[]> (props: {
  h?: boolean,
  name: string,
  disabled?: boolean
  items: T,
  selected: T[number]['value'],
  onChange: (v: T[number]['value']) => void
}) {
  return h(Box, {h: props.h, gap: 16}, props.items.map((item) => {
    return h(Item,{
        disabled: props.selected !== item.value && props.disabled,
    }, [
      h(RadioButton, {
        key: item.value,
        onChange: (e)=>{
          if(props.disabled) e.preventDefault()
          else props.onChange(e.currentTarget.value)
        },
        value: item.value,
        name: props.name,
        type: 'radio',
        checked: props.selected === item.value
      }),
      item.component
    ])
  }))
}


export const Item = styled('label')<{disabled?: boolean}>`
display: grid;
grid-template-columns: min-content auto;
grid-gap: 8px;
&:hover {
  cursor: pointer;
  input {
    border: 2px solid;
  }
}

${props=> props.disabled ? `
color: ${colors.grey55};
input {
  background-color: ${colors.grey90};
  border: 1px solid ${colors.grey80};
  box-shadow:none;
}

&:hover {
  cursor: auto;
  input {
    border: 1px solid ${colors.grey80};
  }
}
` : null}
`

export const RadioButton = styled('input')`
appearance: none;
padding: 0px;
margin-left: 0px;
margin-right: 0px;
border-radius: 50%;
border: 1px solid;
width: 16px;
height: 16px;
box-shadow:0px 0px 0px 2px white inset;

&:active {
outline: none;
}

&:checked {
border: 2px solid;
background-color: black;
}

`

const Container = styled('div')`
display: grid;
background-color: white;
grid-template-columns: 100% auto;
`

const Icon = styled('svg')`
align-self: center;
margin-left: -32px;
`

const SelectEl = styled('select')`
width: 100%;
border: 1px solid;
border-color: ${colors.grey55};
font-size: inherit;

background-color: inherit;
padding: 12px 16px;
appearance: none;
`
