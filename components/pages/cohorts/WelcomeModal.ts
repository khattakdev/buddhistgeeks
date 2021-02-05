import h from 'react-hyperscript'
import { Cohort } from 'src/data'
import { Modal } from 'components/Modal'
import { Box } from 'components/Layout'
import { Info} from 'components/Form'
import { prettyDate } from 'src/utils'
import { Primary, Secondary } from 'components/Button'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { DISCOURSE_URL } from 'src/constants'

export const WelcomeModal = (props: {display:boolean, cohort:Cohort} ) => {
  let router = useRouter()
  return h(Modal, {display:props.display, onExit:()=>{
    router.replace(`/courses/[slug]/[id]/cohorts/[cohortId]`,
                   `/courses/${props.cohort.courses.slug}/${props.cohort.courses.id}/cohorts/${props.cohort.id}`,{shallow: true})
  }}, h(Box, {gap: 32, width: 640, style:{textAlign:"center"}}, [
    h('h2', "You're enrolled!"),
    h(Info, {}, h(Box, [
      h('b', `This cohort starts on ${prettyDate(props.cohort.start_date)}`),
      h(Box, {gap: 8}, [
        h(Link, {
          href: "/calendar"
        }, h('a', [
          h(Secondary, {style:{justifySelf:"center"}}, "Add to calendar"),
        ])),
        h("p",[
          h('small.textSecondary', "If you’ve added to calendar from"),
          h('small.textSecondary', "Hyperlink before, you don’t need to do this. ")
        ])
      ])
    ])),
    h(Box, [
      h('b',
        `Head to the cohort forum to introduce yourself and see what you'll be doing on your first day`),
      h('a', {
        style: {margin: 'auto'},
        href: `${DISCOURSE_URL}/session/sso?return_path=/c/${props.cohort.category_id}`
      }, h(Primary, "Get started")),
    ])
  ]))
}
