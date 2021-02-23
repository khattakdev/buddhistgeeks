import h from 'react-hyperscript'
import styled from '@emotion/styled'

import { Box } from '../Layout'
import {colors} from '../Tokens'
import { Course } from '../../src/data'
import { ReactElement, useEffect } from 'react'
import { useLocalDiscounts, setDiscounts } from 'src/clientData'
import { callApi } from 'src/apiHelpers'
import { GetDiscountResult } from 'pages/api/discounts/[code]'
import Text from 'components/Text'
import { prettyDate } from 'src/utils'

type Props = {
  course: Course
  cohort_start_date?: string,
}

const Enroll:React.FC<Props> = (props) => {
  let {data: discounts} = useLocalDiscounts()
  let price = props.course?.cost || 0
  let discount = discounts?.find(d=>d.course == props.course?.id)
  useEffect(()=>{
    (async function(){
      if(!discount || !discounts) return
      let res = await callApi<null, GetDiscountResult>('/api/discounts/'+discount.code)
      if(res.status !== 200 ||
        res.result.deleted ||
        (res.result.max_redeems !== 0
          && res.result.max_redeems <= res.result.redeems)) {
        setDiscounts(discounts.filter(d=>d.code!==discount?.code))
      }
    })()
  }, [discount, discounts])
  if(discount) {
    if(discount.type === 'absolute') price = price - discount.amount
    else price = price - (Math.floor((discount.amount/100)*price))
  }
  //Laying out the Enroll Panel
  return h(Box, {gap:16}, [
    h(Box, {gap:8}, [
      discount ? h(Cost, {green: true}, '$'+price) : null,
      h(Cost, {discounted: !!discount}, '$' + props.course?.cost),
    ]),
    h(Box, {gap: 8, style:{color: colors.textSecondary}}, [
      !props.cohort_start_date ? null : h('b', `Starts ${prettyDate(props.cohort_start_date)}`),
      h('b', props.course?.duration),
      props.course?.cohort_max_size === 0 ? null : h('b', `Up to ${props.course?.cohort_max_size} learners`),
      h(Box, {gap: 4}, [
        h('b', 'Prerequisites'),
        h(Text, {source: props.course?.prerequisites, disallowedTypes:["heading" as const]})
      ]),
    ]),
    props.children as ReactElement ,
  ])
}

export default Enroll


const Cost = styled('span')<{discounted?:boolean, green?: boolean}>`
width: min-content;
line-height: 56px;
font-size: 56px;
font-weight: bold;
${props=>props.green? `color: ${colors.accentSuccess};`:''}
${props=>props.discounted ? `
font-size: 32px;
line-height: 32px;
background: linear-gradient(20deg, transparent 45.75%, currentColor 47.5%, currentColor 52.5%, transparent 53.25%);
`: ''}
`

// Add a wrapper around Enroll Panel so apply the sticky feature on screens above 768px
export const StickyWrapper = styled('div')`
position: sticky;
top: 32px;
`
