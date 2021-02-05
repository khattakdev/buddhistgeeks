import h from 'react-hyperscript'
import { useUserData } from "src/data"
import { useRouter } from "next/router"
import { useState } from "react"
import { useApi } from "src/apiHelpers"
import { EnrollMsg, EnrollResponse } from "pages/api/cohorts/[cohortId]/enroll"
import { getDiscounts, setDiscounts } from "src/clientData"
import { Box } from "components/Layout"
import { Modal } from "components/Modal"
import { Primary } from "components/Button"
import { getStripe } from 'src/utils'

export const EnrollButton:React.FC<{
  id:number,
  course: number,
  max_size: number,
  learners: number,
  invited: boolean
}> = (props) => {
  let {data: user} = useUserData()
  let router = useRouter()
  let [error, setError] = useState(false)
  let [status, callEnroll] = useApi<EnrollMsg, EnrollResponse>([], async (res)=>{
    let stripe = await getStripe()
    if(res.zeroCost) await router.push('/courses/[slug]/[id]/cohorts/[cohortId]', `/courses/${router.query.slug}/${props.course}/cohorts/${props.id}?welcome`)
    else await stripe?.redirectToCheckout({sessionId: res.sessionId})
  })

  let onClick= async (e:React.MouseEvent)=> {
    e.preventDefault()
    if(user === false) await router.push('/login?redirect=' + encodeURIComponent(router.asPath))
    if(!props.id) return
    let discount = getDiscounts().find(d=>d.course === props.course)
    let res = await callEnroll(`/api/cohorts/${props.id}/enroll`, {discount: discount?.code})
    if(res.status === 403) {
      setError(true)
      setDiscounts(getDiscounts().filter(d=>res.status === 403 && d.code !== res.result.discount))
    }
  }

  return  h(Box, {gap: 4, style:{alignItems: 'center'}}, [
    h(Modal, {display: error}, [
      h('h3', "Sorry, the discount code you're using is no longer valid")
    ]),
    h(Primary, {onClick, status, disabled: !props.invited || (props.max_size !==0 && props.max_size === props.learners)},
      props.children as React.ReactElement),
    props.max_size === 0 ? null : props.max_size > props.learners
      ? h('span.accentSuccess', `${props.max_size - props.learners} ${props.max_size - props.learners === 1 ? 'spot' : 'spots'} left!`)
      : h('span.accentRed', `Sorry! This cohort is full.`)
  ])
}
