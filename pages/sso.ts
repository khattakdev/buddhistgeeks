import h from 'react-hyperscript'
import querystring from 'querystring'
import crypto from 'crypto'
import {useRouter} from 'next/router'
import { GetServerSideProps } from 'next'

import {getToken} from 'src/token'
import {  makeSSOPayload } from 'src/discourse'
import {DISCOURSE_URL} from 'src/constants'

type Props = {error:boolean}
const SSO = ({error}:Props) => {
  let router = useRouter()
  let {sso, sig} = router.query

  if(!sso || !sig) return h('div', 'Invalid SSO parameters!')

  if(error) return h('p', 'An error occured, please check with the reffering site')

  return h('h1', 'Logging you onto discourse...')
}

export default SSO

export const getServerSideProps:GetServerSideProps = async ({req,res, query}) => {
  let token = getToken(req)
  if(!token) {
    res.writeHead(301, {Location: '/login?redirect='+encodeURIComponent(req.url as string)})
    res.end()
    return {props:{}}
  }
  let {sso, sig} = query
  if(typeof sso !== 'string') return {props: {error: true}}

  const hmac1 = crypto.createHmac('sha256', process.env.DISCOURSE_SECRET || '');
  hmac1.update(Buffer.from(sso))

  let verifySig = hmac1.digest('hex')
  if(verifySig !== sig) return  {props: {error: true}}

  let {nonce} = querystring.parse(Buffer.from(sso as string, 'base64').toString())

  res.writeHead(301, {
    Location: `${DISCOURSE_URL}/session/sso_login?`
      + makeSSOPayload({
        nonce:nonce as string ,
        email:token.email,
        external_id: token.id
      })
  })
  res.end()
  return {props:{}}

}
