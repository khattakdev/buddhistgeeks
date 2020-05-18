import styled from '@emotion/styled'
import {colors} from './Tokens'

export let Form = styled('form')`
margin: 0px auto;
display: grid;
grid-gap: 32px;
`

export let Label = styled('label')`
font-weight: bold;
display: grid;
grid-gap: 8px;
`

export let Input = styled('input')`
padding: 12px 16px;
border: 1px solid;
border-color: ${colors.grey55};
font-size: inherit;
`

export const Textarea = styled('textarea')``

export const Error = styled('div')`
background-color: ${colors.backgroundRed};
color: ${colors.accentRed};
padding: 16px;
`

export const Info = styled('div')`
background-color: ${colors.grey95};
padding: 16px;
`
