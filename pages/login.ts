import h from 'react-hyperscript'
import { useState, useEffect } from 'react'
import {useRouter} from 'next/router'
import Link from 'next/link'

import {Narrow, Box} from '../components/Layout'
import { Form, Input, Error, Label, Info} from '../components/Form'
import {Primary, LinkButton} from '../components/Button'
import {callApi} from '../src/apiHelpers'
import {Result, Msg} from './api/login'
import {RequestMsg, RequestResult} from './api/resetPassword/[action]'
import Loader from '../components/Loader'
import {useUserData} from '../src/data'
import TitleImg from '../components/TitleImg'

const Login = () => {
  let [email, setEmail] = useState('')
  let [password, setPassword] = useState('')
  let [loading, setLoading] = useState(false)

  let [error, setError] = useState<'wrong'| null>(null)
  let router = useRouter()
  let {data, mutate} = useUserData()

  let redirect = router.query.redirect as string | null
  let {reset} = router.query
  if(data) router.push(redirect as string || '/')

  useEffect(()=>setError(null), [email, password])

  if(typeof reset !== 'undefined') return h(ResetPassword)

  const onSubmit = async (e:React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    let res = await callApi<Msg, Result>('/api/login', {email, password})
    if(res.status === 200) {
      let data = res.result
      if(redirect) {
        if(redirect[0] !== '/' || redirect.startsWith('/sso')) return window.location.assign(redirect)
        await mutate(data)
        router.push(redirect as string)
      }
      else router.push('/dashboard')
    }
    else {
      setLoading(false)
      setError('wrong')
    }
  }

  const Errors: {[key in Exclude<typeof error, null>]: React.ReactElement} = {
    'wrong': h('div', [
      "That email and password don't match. You can ",
      h(Link, {href: '/login?reset'}, h('a', 'reset your password here')),
      '.'
    ]),
  }

  return h(Narrow, [
    h(Form, {onSubmit}, [
      h(TitleImg,{height: 163, width:299, src:'/img/dragon.png'}),
      h('h1', 'Welcome Back!'),
      error ? h(Error, {}, Errors[error]) : null,
      h(Label, [
        'Your Email',
        h(Input, {
          type: 'email',
          value: email,
          required:true,
          onChange: (e)=> setEmail(e.currentTarget.value)
        }),
      ]),
      h(Label, [
        'Password',
        h(Input, {
          type: 'password',
          value: password,
          required:true,
          onChange: (e)=> setPassword(e.currentTarget.value)
        }),
        h(Link, {href: '/login?reset'}, h(LinkButton, 'Reset Password'))
      ]),
      h(Primary, {type: 'submit', style: {justifySelf:'end'}}, loading ? h(Loader) : 'Log In'),
    ]),
  ])
}


const ResetPassword:React.SFC = () => {
  let [email, setEmail ] = useState('')
  let [status, setStatus] = useState<'normal' | 'loading' | 'success' | 'error'>('normal')

  switch(status) {
    case 'normal':
    case 'loading':
      return h(Narrow, [
        h(Form, {onSubmit: async e =>{
          e.preventDefault()
          setStatus('loading')
          let res = await callApi<RequestMsg, RequestResult>('/api/resetPassword/request', {email})

          if(res.status === 200) setStatus('success')
          else setStatus('error')
        }}, [
          h('h1', 'Reset your password'),
          h(Label, [
            'Your Account Email',
            h(Input, {
              type: 'email',
              value: email,
              placeholder: 'your account email',
              onChange: e=>setEmail(e.currentTarget.value)
            }),
          ]),
          h('div', {style: {display: 'grid', justifyItems:'end', gridGap: '8px'}}, [
            h(Primary, {type: 'submit'}, status === 'loading' ? h(Loader) : 'reset password')
          ])
        ])
      ])
    case 'success': return h(Narrow, {}, h(Box, {gap: 16}, [
      'We sent an email with a password reset link to',
      h(Info, email),
      'It expires in 30 minutes.',
      h('br'),
      h(Primary, {
        style: {width: '100%'},
        onClick: ()=>setStatus('normal')
      }, 'Send another link')
    ]))
    case 'error': return h(Narrow, [h(Error, 'something went wrong, please refresh and try again')])
  }
}

export default Login
