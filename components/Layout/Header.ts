import styled from '@emotion/styled'
import h from 'react-hyperscript'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, Fragment, useEffect, useRef } from 'react'

import {colors, Mobile} from '../Tokens'
import { Logo } from '../Icons'
import { Box, Seperator, FormBox, LabelBox} from './index'
import { useUserData } from '../../src/data'
import { useMediaQuery } from '../../src/hooks'
import { Textarea, Input } from '../Form'
import { Secondary, Primary, LinkButton } from '../Button'
import { Modal } from '../Modal'
import { useApi } from '../../src/apiHelpers'
import { FeedbackMsg, FeedbackResult } from '../../pages/api/feedback'

import {DISCOURSE_URL} from 'src/constants'

const COPY = {
  feedbackTitle: "Tell us what's on your mind!",
  feedbackSuccess: "🎉 Thank you for your thoughts 🎉"
}

export default function Header() {
  const {data: user, mutate:mutateUser}= useUserData()
  let mobile = useMediaQuery('(max-width:768px)')
  return h(HeaderContainer, [
    h(Link, {href: user ? '/dashboard' : '/', passHref:true}, h('a', [Logo])),
    mobile ? h(MobileMenu, {user, mutateUser}) : h(Container, {}, [
      h(LoginButtons, {user, mutateUser}),
      !user ? null : h(FeedbackModal),
      h(Seperator, {style:{height:"100%"}}),
      !user ? null : h(NavLink, {href:DISCOURSE_URL}, 'forum'),
      h(Link, {href: "/library", passHref: true}, h(NavLink, 'library')),
      h(LearnMenu)
    ]),
  ])
}

const LearnMenu = ()=>{
  let [open, setOpen] = useState(false)
  let menuRef = useRef<HTMLElement>(null)
  useEffect(()=>{
    if(!open || !menuRef) return
    let listener = (e:MouseEvent)=>{
      if(!menuRef.current?.contains(e.target as Node | null)) setOpen(false)
    }
    window.addEventListener('click', listener)
    return ()=>window.removeEventListener('click', listener)

  }, [open])
  return h('div', [
    h(CoursesButton, {onClick:()=>setOpen(!open)}, 'learn'),
    !open ? null : h(Dropdown, {ref: menuRef, onClick:()=>setOpen(false)}, [
      h(LearnMenuItems)
    ])
  ])
}

let LearnMenuItems = ()=> h('div', {style:{textAlign:'right', display:"grid"}}, [
  h(Link, {href:"/courses"},h(LearnMenuItem, [
    h('b.mono', 'courses'),
    h('p', "structured deep learning")
  ])),
  h(Link, {href:"/clubs"}, h(LearnMenuItem, [
    h('b.mono', 'clubs'),
    h('p', "social peer learning")
  ])),
  h(Link, {href:"/events"}, h(LearnMenuItem, [
    h('b.mono', 'events'),
    h('p', "single sessions")
  ])),
      ])

let LearnMenuItem = styled('a')`
&:hover {
background-color: ${colors.accentLightBlue};
cursor: pointer;
}

color:${colors.textSecondary};
padding:8px 16px;
`

const Dropdown = styled('nav')`
position: absolute;
box-sizing: border-box;

z-index: 9;

border: 1px solid;
border-radius: 2px;
margin-left: -120px;
transform: translate(0px, 8px);
background-color:${colors.appBackground};
`

const MobileMenu = (props:{user:any, mutateUser: any}) => {
  let [open, setOpen] = useState(false)
  let router = useRouter()
  useEffect(()=>{
    let handleRouteChange = ()=> setOpen(false)
    router.events.on('routeChangeComplete', handleRouteChange)
    return ()=>{ router.events.off('routeChangeComplete', handleRouteChange)}
  },[router])

  if(open) return h(FullPageOverlay, {}, h(Box, {padding: 24}, [
    h(HeaderContainer, {style:{paddingBottom:"0px"}}, [
      h(Link, {href: props.user ? '/dashboard' : '/', passHref:true}, h('a', [Logo])),
      h(Container, [
        h(LinkButton, {style: {justifySelf: 'right', textDecoration:"none"}, onClick: ()=> {setOpen(false)}}, 'close')
      ])
    ]),
    h(Box, {style:{textAlign: "right"}},[
      h(Link, {href:"/courses"},h(NavLink, [
        h('b', 'courses'),
        h('p', "structured deep learning")
      ])),
      h(Link, {href:"/clubs"}, h(NavLink, [
        h('b', 'clubs'),
        h('p', "social peer learning")
      ])),
      h(Link, {href:"/events"}, h(NavLink, [
        h('b', 'events'),
        h('p', "single sessions")
      ])),
      !props.user ? null : h(NavLink, {href:DISCOURSE_URL}, h('b', 'forum')),
      h(Link, {href: "/library", passHref:true}, h(NavLink, {}, h('b', 'library'))),
      h(Seperator),
      h(Box, {gap: 16, style: {textAlign: 'right'}}, [
        h(LoginButtons, props),
      ]),
      h(Seperator),
      !props.user ? null : h(Feedback)
    ])
  ]))
  else return h(Container, [
    h(LinkButton, {style: {justifySelf: 'right', paddingLeft: '10px', textDecoration: "none"}, onClick:()=>setOpen(true)}, 'menu')
  ])
}

const LoginButtons = (props:{user:any, mutateUser:any}) => {
  let router = useRouter()
  let redirect = router.pathname === '/' ? '' : '?redirect=' + encodeURIComponent(router.asPath)
  if(!props.user) return h(Fragment, {}, [
    h(Link, {href: '/signup'}, h(NavLink,  'sign up')),
    h(Link, {href: '/login' + redirect}, h(NavLink, "log in")),
  ])
  else {
    return h(NavLink, {onClick: async (e)=>{
      e.preventDefault()
      let res = await fetch('/api/logout')
      if(res.status === 200) {
        props.mutateUser(false)
      }
    }}, 'logout')
  }
}

const Feedback = ()=> {
  let router = useRouter()
  let {data:user}= useUserData()
  let [form, setForm] = useState({email: '', feedback: ''})
  let [status, callFeedback, setStatus] = useApi<FeedbackMsg, FeedbackResult>([])
  let onSubmit = (e:React.FormEvent)=>{
    e.preventDefault()
    if(status==='success') return
    callFeedback('/api/feedback', {
      feedback:form.feedback,
      email: user ? undefined : form.email,
      page: router.pathname,
      username: user ? user.username : undefined
    })
  }

  if(status=== 'success') return h(Box, {style: {textAlign: 'center'}}, [
    COPY.feedbackSuccess,
    h('br'),
    h(LinkButton, {onClick: () => {
      setStatus('normal')
      setForm({...form, feedback: ''})
    }}, "I have more feedback!")
  ])
  return h(FormBox, {onSubmit, gap: 16}, [
    h('h4', COPY.feedbackTitle),
    h(Textarea, {value: form.feedback, required: true, onChange: e=>setForm({...form, feedback: e.currentTarget.value})}),
    user ? null : h(LabelBox, [
      h('h4', "Your email (optional)"),
      h(Input, {type: 'email', value: form.email, onChange: e=>setForm({...form, email: e.currentTarget.value})}),
    ]),
    h(Secondary, {
      type: 'submit',
      disabled: form.feedback === '',
      style:{justifySelf:'center'}
    }, "Submit")
  ])
}

const FeedbackModal = ()=>{
  let [display, setDisplay] = useState(false)
  return h(Fragment, [
    h(NavLink, {onClick: ()=>setDisplay(true)},'feedback'),
    h(Modal, {display, onExit: ()=>setDisplay(false)}, h(Feedback))
  ])
}

const CoursesButton = styled(Primary)`
color: blue;
background-color: white;
border-color: blue;
padding: 7px 16px;
`

const FullPageOverlay = styled('div')`
display: block;
position: fixed;
z-index: 11;
top: 0;
left: 0;
width: 100vw;
height: 100vh;
background-color: ${colors.appBackground};
`

const Container = styled('div')`
justify-self: right;
align-self: center;
align-items: center;
display: grid;
grid-gap: 32px;
grid-auto-flow: column;
grid-auto-columns: max-content;
`

const NavLink = styled('a')`
font-family: 'Roboto Mono', monospace;
text-decoration: none;
color: ${colors.textSecondary};

&:visited {
color: ${colors.textSecondary};
}

&:hover {
cursor: pointer;
color: #00008B;
}
`

const HeaderContainer = styled('div')`
display: grid;
grid-template-columns: auto auto;
height: 32px;
padding-bottom: 64px;
align-items: center;

${Mobile} {
  padding-bottom: 32px ;
  padding-top: 16px ;
}
`

