import h from 'react-hyperscript'

import styled from '@emotion/styled'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {useState, useEffect, Fragment} from 'react'
import { InferGetStaticPropsType } from 'next'

import CourseDetails from 'components/Course/Enroll'
import { EnrollButton } from 'components/Course/EnrollButton';
import { TwoColumn, Box, Seperator, Sidebar, WhiteContainer} from 'components/Layout'
import { VerticalTabs, StickyWrapper } from 'components/Tabs'
import { Primary, Destructive, DestructiveSmallButton, Secondary, LinkButton } from 'components/Button'
import Loader, { PageLoader } from 'components/Loader'
import { CheckBox, Info, Input } from 'components/Form'
import { Modal } from 'components/Modal'
import {TwoColumnBanner} from 'components/Banner'
import Text from 'components/Text'
import {WelcomeModal} from 'components/pages/cohorts/WelcomeModal'

import { cohortName, prettyDate} from 'src/utils'
import {  getTaggedPost } from 'src/discourse'
import {DISCOURSE_URL} from 'src/constants'
import { callApi, useApi } from 'src/apiHelpers'
import { useCohortData, useUserCohorts, useUserData, useCourseData, Cohort, useProfileData } from 'src/data'
import ErrorPage from 'pages/404'
import { cohortDataQuery, UpdateCohortMsg, UpdateCohortResponse } from 'pages/api/cohorts/[cohortId]'
import { courseDataQuery } from 'pages/api/courses/[id]'
import Head from 'next/head'
import { CohortEvents } from 'components/pages/cohorts/Events'
import { CreateEvent } from 'components/pages/cohorts/CreateEvent'
import { AccentImg } from 'components/Images'
import { TodoList } from 'components/TodoList'
import { UnEnrollMsg, UnEnrollResponse } from 'pages/api/cohorts/[cohortId]/enroll'

type Props = InferGetStaticPropsType<typeof getStaticProps>
const WrappedCohortPage = (props: Props)=>  props.notFound ? h(ErrorPage) : h(CohortPage, props)
export default WrappedCohortPage
const CohortPage = (props: Extract<Props, {notFound:false}>) => {
  let router = useRouter()
  let {data: user} = useUserData()
  let {data: userCohorts} = useUserCohorts()
  let {data:profile} = useProfileData(user ? user.username : undefined)
  let {data: cohort, mutate} = useCohortData(props.cohortId, props.cohort)
  let {data: course} = useCourseData(props.courseId, props.course)
  let selectedTab = router.query.tab as string | undefined

  useEffect(()=>{
    mutate(undefined, true)
  }, [!!cohort])


  if(!cohort || !course) return h(PageLoader)

  let invited = !!userCohorts?.invited_courses.find(course=>course.id === props.course.id )
  let inCohort = cohort.people_in_cohorts.find(p => p.person === (user ? user.id : undefined))
  let isFacilitator  = !!user && !!cohort.cohort_facilitators.find(f=>user &&f.people.username === user.username)
  let isStarted = cohort && new Date() > new Date(cohort.start_date)

  let Tabs = {
    Artifacts: props.artifacts.text === '' ? null : h(Box, {gap: 64}, [
      h(Box, {gap: 32},[
        h(Box, [
          h(Text, {source: props.artifacts?.text})
        ]),
      ])
    ]),
    Schedule: cohort.cohort_events.length === 0 && !isFacilitator ? null : h(Box, {gap: 32}, [
      isFacilitator || inCohort ? h(CreateEvent, {
        cohort: cohort.id,
        people: [...cohort.people_in_cohorts.map(p=>p.people.username), ...cohort.cohort_facilitators.map(f=>f.people.username)],
        mutate: (c)=>{
          if(!cohort) return
          mutate({...cohort, cohort_events: [...cohort.cohort_events, c]})
        }}) : null,
      h(Box, [
        cohort.cohort_events.length === 0
          ? h(WhiteContainer, [
            h(Box, {gap:16, style: {maxWidth: 400, textAlign: 'center', margin: 'auto'}}, [
              h( EmptyImg, {src: '/img/empty.png'}),
              h('small.textSecondary', "Events are great for scheduling live calls or other important cohort dates. Learners can add these to their calendars. Looks like you haven't created any events yet. Hit the button above to schedule one!!" ),
            ])])
          : h(CohortEvents, {
            facilitating: isFacilitator,
            inCohort:!!inCohort,
            people: cohort.people_in_cohorts.map(p=>p.people.username),
            cohort: cohort.id,
            events: cohort.cohort_events.filter(c=>{
              if(!user || !cohort) return c.everyone
              if(isFacilitator) return true
              return c.everyone || c.events.people_in_events.find(p=>user&&p.people.username===user.username)
            }),
            mutate: (events)=>{
              if(!cohort) return
              mutate({
                ...cohort, cohort_events: events})
            },
            showCal: (inCohort || isFacilitator) && cohort.cohort_events.length > 0
          })
      ])
    ]),
    [course.type === 'club' ? "Details" : "Curriculum"]: h(Box, [
      !isFacilitator ? null : h(Info, [
        `💡 You can make changes to this page by editing `,
        h('a', {href: `${DISCOURSE_URL}/session/sso?return_path=/t/${props.curriculum?.id}`}, `this topic`),
        ` in the forum`
      ]),
      h(Text, {source:props.curriculum?.text})
    ]),
    Members: h(CohortMembers, {cohort: cohort, isFacilitator, mutate, user: user ? user.id : undefined})
      } as {[k:string]:React.ReactElement}
  let tabKeys = Object.keys(Tabs).filter(t=>!!Tabs[t])

  return h('div', {}, [
    h(Head, {children: [
      h('meta', {property:"og:title", content:course.name, key:"og:title"}),
      h('meta', {property: "og:description", content: "Starting " + prettyDate(cohort.start_date), key: "og:description"}),
      h('meta', {property: "og:image", content: course.card_image.split(',')[0], key: "og:image"}),
      h('meta', {property: "twitter:card", content: "summary", key:"twitter:card"})
    ]}),
    h(WelcomeModal, {display:router.query.welcome !== undefined, cohort, user_calendar: profile ? profile.calendar_id : ''}),
    h(Banners, {cohort, mutate, enrolled: !!inCohort, facilitating: isFacilitator}),
      h(Box, {gap: 32}, [
      h(TwoColumn, [
        h(Box, {gap: 8, style:{gridColumn: 1}}, [
          course.type === 'course' ? null :h(Box, {h: true}, props.course.card_image.split(',').map(src=>h('img', {src, style:{imageRendering: 'pixelated'}}))),
          h('h1', cohortName(cohort.name)),
          h(Link,{
            href:`/courses/${cohort.courses.slug}/${cohort.courses.id}`
          } ,h('a.notBlue', {}, h('h3.textSecondary', cohort?.courses.name))),
          h('p.big', cohort.description)
        ]),
        Tabs[selectedTab ? selectedTab : tabKeys[0]],
        h(Sidebar, {} , [
          h(StickyWrapper, [
            h(Box, {gap: 32}, [
              inCohort || isStarted || isFacilitator ? null : h(CourseDetails, {course}),
              inCohort || isStarted || isFacilitator ? null
                : h(EnrollButton, {
                  id: cohort.id,
                  course: course.id,
                  max_size: course.cohort_max_size,
                  learners: cohort.people_in_cohorts.length,
                  invited: !course.invite_only || invited}, "Join this cohort"),
              h(Box, [
                h('h3', "Information"),
                h(VerticalTabs, {
                  selected: selectedTab && Tabs[selectedTab] ? selectedTab : tabKeys[0],
                  tabs: tabKeys,
                  onChange: (tab)=>{
                    let route = new URL(window.location.href)
                    route.searchParams.set('tab', tab)
                    router.replace(route, undefined, {shallow: true})
                  }
                })
              ]),
              inCohort || isFacilitator || cohort.completed ? h(Box, {}, [
                !isFacilitator ? null : h(Link, {href:window.location.pathname + '/settings'}, h('a', {}, h(Primary, "Cohort Settings"))),
                !inCohort && !isFacilitator ? null : h(Box, [
                  h('a', {href: `${DISCOURSE_URL}/session/sso?return_path=/c/${cohort.category_id}`}
                    , h(Secondary, 'The Forum')),
                  !isFacilitator ? null : h(Link, {
                    href: "/courses/[slug]/[id]/cohorts/[cohortId]/templates",
                    as: `/courses/${cohort.courses.slug}/${cohort.courses.id}/cohorts/${cohort.id}/templates`
                  }, h(Secondary, 'Forum Post from Template')),
                  !cohort.completed && isFacilitator && isStarted ? h(MarkCohortComplete, {cohort, mutate}) : null,
                ])
              ]) :  null,
            ])
          ])
        ])
      ])
    ])
  ])
}


export let EmptyImg = styled ('img') `
image-rendering: pixelated;
image-rendering: -moz-crisp-edges;
image-rendering: crisp-edges;
display: block;
margin: auto auto;
border: none;
height: 200px;
width: 200px;
`

export const CohortMembers = (props:{cohort:Cohort, isFacilitator: boolean, user?: string, mutate: (c:Cohort)=>void}) => {
  let [unenrollState, setUnenrollState] = useState<{personID:string, username: string, cohortID:number, display_name?:string, removeMember:()=>void}>()
  return h(Fragment, [
    !unenrollState ? null : h(UnenrollModal, {
      display: !!unenrollState, onExit:()=>setUnenrollState(undefined),
      ...unenrollState
    }),
    h(Box, {gap:16}, [
      h('h3', "Facilitators"),
      props.isFacilitator ? null : h(Info, [
        `Questions about this `,
        props.cohort.courses.type === 'club' ? `club` : `course`,
        `? `,
        h('a', {href: `https://forum.hyperlink.academy/new-message?groupname=${props.cohort.courses.slug}-m`, target: `_blank`}, `Message the facilitator`),
        ` on the forum.`
      ]),
      ...props.cohort.cohort_facilitators.map(f=>h(Box, [
        props.user === f.facilitator ? h(Info, [`💡 You can edit your bio in the profile tab on your `, h(Link, {href: '/dashboard'}, h('a', 'dashboard'))]) : null,
        h('h3', [
          ``, h(Link, {
            href: '/people/[id]',
            as: `/people/${f.people.username}`
          }, h('a', {className: 'notBlue'}, f.people.display_name || f.people.username)),
          f.people.pronouns ? h('span.textSecondary', {}, ` (${f.people.pronouns})`) : null
        ]),
        h(Text, {source: f.people.bio || ''}),
      ])),

    // message facilitator - shows for logged in and anon users; hidden on things you're facilitating


    props.cohort.people_in_cohorts.length === 0 ? null : h(Box, {h: true}, [
      h('h4', ["Members ", h('span.textSecondary', `(${props.cohort.people_in_cohorts.length}${props.cohort.courses.cohort_max_size !== 0 ? `/${props.cohort.courses.cohort_max_size}` :''})`)]),
      !props.isFacilitator ? null : h('a', {
        href:`mailto:?bcc=${props.cohort.people_in_cohorts.map(p=>p.people.email).join(',')}`
      }, 'email everyone')
    ]),
    ...props.cohort.people_in_cohorts
      .map((person)=>{
        return h('div', {style:{display: 'grid', gridTemplateColumns: "auto auto"}}, [
          h(Box, {h: true}, [
            h(Link, {
              href: '/people/[id]',
              as: `/people/${person.people.username}`
            }, [
              h('a', {className: 'notBlue'}, person.people.display_name || person.people.username),
            ]),
            person.people.pronouns ? h('span.textSecondary', {}, ` (${person.people.pronouns})`) : null,
          ]),
          !props.isFacilitator ? null : 
          h('div', {style:{justifySelf:"right"}}, [
            h('a', {style:{marginRight:"10px"}, href:`mailto:${person.people.email}`}, "email"),
            h(DestructiveSmallButton, {onClick:()=>{
              setUnenrollState({
                personID: person.person,
                cohortID: props.cohort.id,
                username: person.people.username,
                display_name: person.people.display_name,
                removeMember: ()=>{
                  props.mutate({...props.cohort, people_in_cohorts: props.cohort.people_in_cohorts.filter(p=>p.person!== person.person)})
                }
              })
            }}, "unenroll")
          ])
        ])
      }),
    ])
  ])
}

const UnenrollModal = (props:{
  personID: string,
  username: string,
  cohortID:number,
  display_name?: string,
  removeMember: ()=>void
  display: boolean,
  onExit: ()=>void
})=>{
  let [status, callUnenroll] = useApi<UnEnrollMsg, UnEnrollResponse>([])
  return h(Modal, {display: props.display, onExit:props.onExit, hideCloseButton: true} ,[
    status === 'success'
      ? h(Box, {style:{textAlign:'center', justifyItems:'center'}}, [
        h('h2', "Unenrolled!"),
        h('p', [`You've unenrolled `, h('b', props.display_name || props.username), ` from this cohort`]),
        h('p', [`They'll be refunded within 5 business days`]),
        h(Secondary, {onClick:props.onExit, style:{width:"250px"}}, "exit")
      ])
      : h(Box, {gap:32, style:{textAlign:'center', justifyItems:'center'}}, [
        h(Box,[
          h('h2', "Un-Enroll and Issue Refund"),
          h('p', [
            `You are about to un-enroll `, h('b', props.display_name || props.username), ` from this cohort`
          ]),
        ]),
        h(Box, {gap:8}, [
          h(Destructive, {status, onClick:async ()=>{
            let result = await  callUnenroll(`/api/cohorts/${props.cohortID}/enroll`, {
              person: props.personID
            }, "DELETE")
            if(result.status===200){
              props.removeMember()
            }
          }, style:{width:"250px"}}, 'Un-enroll'),
          h(Secondary, {onClick:props.onExit, style:{width:"250px"}}, "Cancel")
        ])
      ])
  ])
}

// Button to Publish Draft Cohort
const MarkCohortLive = (props:{cohort:Cohort, mutate:(c:Cohort)=>void})=> {
  let [state, setState] = useState<'normal' | 'confirm' | 'loading'| 'complete' >('normal')
  if(state === 'confirm' || state === 'loading') return h(Modal, {display: true, closeText:"nevermind", onExit: ()=> setState('normal')}, [
    h(Box, {gap: 32}, [
      h('h2', "Are you sure?"),
      h(Box, {gap: 16, style: {textAlign: 'right'}}, [
        h(Primary, {onClick: async e => {
          e.preventDefault()
          setState('loading')
          let res = await callApi<UpdateCohortMsg, UpdateCohortResponse>(`/api/cohorts/${props.cohort.id}`, {data: {live: true}})
          if(res.status === 200) props.mutate({...props.cohort, live: res.result.live})
          setState('complete')
        }}, state === 'loading' ? h(Loader) : 'Publish!'),
      ])
    ])
  ])

  return h(Primary, {style: {justifySelf:"center"}, onClick: async e => {
    e.preventDefault()
    setState('confirm')
  }}, 'Publish!')
}
//End Button to publish cohort

//Modal to complete cohort
const MarkCohortComplete = (props:{cohort:Cohort, mutate:(c:Cohort)=>void})=> {
  let [state, setState] = useState<'normal' | 'confirm' | 'loading'| 'complete' >('normal')

  if(state === 'confirm' || state === 'loading') return h(Modal, {display: true, closeText: "nevermind", onExit: ()=> setState('normal')}, [
    h(Box, {gap: 32}, [
      h('h2', {style:{textAlign:'center'}}, "Are you sure?"),
      h(Box, {gap: 16}, [
        'Before closing this course, please...',
        h(Box, {gap: 16}, [
          h(CheckBox, [
            h(Input, {
              type: 'checkbox',
            }),
            h("span", [
            "Use the ", h(Link, {href: `http://hyperlink.academy/courses/${props.cohort.courses.slug}/${props.cohort.courses.id}/cohorts/${props.cohort.id}/templates?template=Artifact`}, "Artifact template"), " to publicly share any artifacts or final projects produced in the cohort"
            ]), 
          ]),
            h(CheckBox, [
              h(Input, {
                type: 'checkbox'
              }),
              h("span", [
              "Use the ", h(Link, {href: `http://hyperlink.academy/courses/${props.cohort.courses.slug}/${props.cohort.courses.id}/cohorts/${props.cohort.id}/templates?template=Retro`}, "Retrospective template"), " to post a cohort retro in the forum." 
              ]),
            ]),
          h(Seperator), 
          h('span', [
            "You can find more information about artifacts and retros in our ", h(Link, {href: `https://hyperlink.academy/manual/facilitators#facilitating-a-cohort`}, "facilitator guide"), "." 
          ]),
        ]),
      ]),
      h(Primary, {style: {justifySelf:'center'}, onClick: async e => {
        e.preventDefault()
        setState('loading')
        let res = await callApi<UpdateCohortMsg, UpdateCohortResponse>(`/api/cohorts/${props.cohort.id}`, {data:{completed:true}})
        if(res.status === 200) props.mutate({...props.cohort, completed: res.result.completed})
        setState('complete')
      }}, state === 'loading' ? h(Loader) : 'Mark this cohort complete'),
    ])
  ])

  return h(Destructive, {onClick: async e => {
    e.preventDefault()
    setState('confirm')
  }}, 'Mark as complete')
}
//end modal to complete cohorts


// Defining Banners (upcoming-facilitator, upcoming-learner, draft)
const Banners = (props:{
  cohort: Cohort
  mutate: (c:Cohort)=>void
  facilitating?: boolean,
  enrolled?: boolean,
})=>{
  let isStarted = (new Date(props.cohort.start_date)).getTime() - (new Date()).getTime()
  let forum = `${DISCOURSE_URL}/session/sso?return_path=/c/${props.cohort.category_id}`

  if(props.facilitating && !props.cohort.live) return h(TODOBanner, props)

  if(props.cohort.completed && (props.enrolled || props.facilitating))  return h(TwoColumnBanner, [
    h(Box, {gap: 8, className: "textSecondary"}, [
      h('h4', `You completed this course on ${prettyDate(props.cohort.completed || '')}!`),
      h('p', [`This cohort's `, h('a', {href: forum}, 'private forum'), ` will always be open! Feel free to come back whenever`])
    ])
  ])

  if(isStarted > 0 && (props.enrolled || props.facilitating)) {
    if(props.facilitating) {
      return h(TwoColumnBanner, [
          h(Box, {gap: 8, className: "textSecondary"}, [
            h('h4', `You're facilitating in ${Math.round(isStarted / (1000 * 60 * 60 * 24))} days `),
            h('p', [
              `Check out the `,
              h('a', {href: forum}, 'forum'),
              ` and meet the learners. You can also read our `, h('a', {href: "/manual/facilitators"}, 'facilitator guide'), ` in the Hyperlink Manual`
            ])
          ])
      ])
    }
    return h(TwoColumnBanner, [
        h(Box, {gap: 8, className: "textSecondary"}, [
          h('h4', `You start in ${Math.round(isStarted / (1000 * 60 * 60 * 24))} days `),
          h('p', [
            `Check out the `,
            h('a', {href: forum}, 'forum'),
            ` while you're waiting. You can introduce yourself and learn more about what you'll be doing when your cohort starts!`
          ])
        ])
    ])
  }
  return null
}

const TODOBanner = (props:{
  cohort:Cohort, 
  mutate:(c:Cohort)=>void
}) => {
  let [expanded, setExpanded] = useState(false)

  return h(TwoColumnBanner, {red: true}, [
    h(BannerContent, [
      h(AccentImg, {height:32, width:36, src:"https://hyperlink-data.nyc3.cdn.digitaloceanspaces.com/icons/Seedling.png"}),
      h(Box, {gap:8}, [
        h('h4', "This cohort is still a draft"),
        h('p', 'It’s hidden from public view. People can’t join until you publish it.')
      ]),

      ... !expanded ? [] : [
        h(AccentImg, {height:32, width:36, src:"https://hyperlink-data.nyc3.cdn.digitaloceanspaces.com/icons/Bud.png"}),
        h(Box, {gap:16}, [
          h('h4', "Before you publish this cohort make sure that you ...  "),
          h(TodoList, {
            persistKey: "cohort-publish-todo-"+props.cohort.id,
            items: [
              "Add events to your cohort schedule for any live calls or important dates people need to remember.",
              h("span", [
                "Fill out ", h(Link, {href: `https://hyperlink.academy/dashboard?tab=Profile`}, "your bio"), " and tell people more about you."
              ]),
              h("span", [
                "Fill out the ", h("a", {href: `${DISCOURSE_URL}/session/sso?return_path=/c/${props.cohort.category_id}`}, "Getting Started topic"), " in the forum with any first steps learners should take. This will be linked in the welcome email sent to everyone who enrolls."
              ])
            ]
          })
        ]),

        h(AccentImg, {height:32, width:36, src:"https://hyperlink-data.nyc3.cdn.digitaloceanspaces.com/icons/Flower.png"}),
        h(Box, {gap:16}, [
          h('h4', "Once you're ready, hit publish and start spreading the word!"),
          h(MarkCohortLive, {cohort:props.cohort, mutate: props.mutate})
        ])
      ]
    ]),

    h(LinkButton, {style:{justifySelf: 'right', textDecoration: 'none'}, onClick: ()=>setExpanded(!expanded)}, expanded ? "hide checklist" : "show checklist") 
  ])
}


const BannerContent = styled('div') `
display: grid; 
grid-template-columns: min-content auto;
grid-column-gap: 16px;
grid-row-gap: 32px;

`

//End Bannera

export const getStaticProps = async (ctx:any)=>{
  let courseId = parseInt(ctx.params?.id as string || '' )
  if(Number.isNaN(courseId)) return {props: {notFound: true}} as const

  let course = await courseDataQuery(courseId)
  if(!course) return {props: {notFound: true}} as const

  let cohortId = parseInt(ctx.params?.cohortId as string || '')
  if(Number.isNaN(cohortId)) return {props:{notFound: true}} as const
  let cohort = await cohortDataQuery(cohortId)

  if(!cohort) return {props: {notFound: true}} as const

  let [artifacts, curriculum] = await Promise.all([
    getTaggedPost(cohort.category_id, 'artifact'),
    getTaggedPost(cohort.courses.category_id, 'curriculum')
  ])
  return {props: {
    notFound: false,
    courseId,
    cohortId,
    cohort,
    course,
    curriculum,
    artifacts},
          revalidate: 1} as const
}

export const getStaticPaths = () => {
  return {paths:[], fallback: true}
}
