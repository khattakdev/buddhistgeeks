import querystring from 'querystring'
import crypto from 'crypto'
import { NextApiRequest, NextApiResponse } from 'next'
import {getToken} from 'src/token'

type SSOResponse = {
  requestID: string,
  username: string
  email: string
  display_name?: string
  user: string
}

type SSORequest = {
  requestID: string
}


export default async (req:NextApiRequest,res:NextApiResponse) => {
  let token = getToken(req)
  if(!token) {
    return res.writeHead(307, {Location: '/login?redirect='+encodeURIComponent(req.url as string)}).end()
  }
  let {payload, signature} = req.query
  if(typeof payload !== 'string') return {props: {error: true}}

  let verifySig = sign(payload)
  if(verifySig !== signature) return  {props: {error: true}}

  let SSOtoken:SSORequest = JSON.parse(Buffer.from(payload as string, 'base64').toString())

  let response:SSOResponse = {
    requestID: SSOtoken.requestID,
    username: token.username,
    email: token.email,
    user: token.id
  }
  let responsePayload = Buffer.from(JSON.stringify(response)).toString('base64')
  let responseSignature = sign(responsePayload)


  res.writeHead(307, {
    Location: `${process.env.HYPERSPACE_URL}/api/sso_response?`
      + querystring.stringify({payload:responsePayload, signature:responseSignature})
  })
  return res.end()
}

let sign = (input: string)=>{
  const hmac = crypto.createHmac('sha256', process.env.HYPERSPACE_SSO_SECRET || '');
  hmac.update(Buffer.from(input))
  return hmac.digest('base64')
}
