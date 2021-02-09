import {multiRouteHandler, ResultType, Request} from 'src/apiHelpers'
import {PrismaClient} from '@prisma/client'
import hmac from 'src/hmac'
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs'
import {sendResetPasswordEmail} from 'emails'

const prisma = new PrismaClient()

export type RequestMsg = {
  email: string
}

export type ResetMsg = {
  key: string
  password: string
}

export type RequestResult = ResultType<typeof requestResetPassword>
export type ResetResult = ResultType<typeof resetPassword>

export default multiRouteHandler('action', {
  request: requestResetPassword,
  reset: resetPassword
})

async function requestResetPassword (req:Request) {
  let msg = req.body as Partial<RequestMsg>
  if(!msg.email) {
    return {status: 403, result: "Error: invalid request, missing email"} as const
  }

  let user = await findUser(msg.email)
  if(!user) {
    return {status: 200, result: ""} as const
  }

  else {
    let key = await createResetKey(msg.email)

    let origin = (new URL(req.headers.referer || '')).origin
    let url = `${origin}/resetPassword?&key=${key}`

    await sendResetPasswordEmail(msg.email, {
      action_url: url,
      name: user.display_name || user.username
    })
    return {status: 200, result: ""} as const
  }
}

async function resetPassword (req:Request) {
  let msg = req.body as Partial<ResetMsg>
  if(!msg.key || !msg.password) {
    return {
      status: 400,
      result: "Error: invalid message, missing key or new password"
    } as const
  }

  let hash = hmac(msg.key)
  let resetKey = await getResetKey(hash)
  if(!resetKey) {
    return {
      status: 403,
      result: "Error: invalid reset key"
    } as const
  }

  let date = new Date(resetKey.created_time)

  if((Date.now() - date.getTime())/(1000 * 60) > 30)  {
    return {
      status: 403,
      result: "Error: password reset key out of date"
    } as const
  }

  await updatePassword(resetKey.email, msg.password, hash)
  return {status: 200, result:''}
}

async function getResetKey(hash: string) {
  return prisma.password_reset_keys.findUnique({where:{key_hash:hash}})
}


const createResetKey = async (email: string) => {
  let key = uuidv4()
  await prisma.password_reset_keys.create({data:{
      email,
      created_time: new Date(Date.now()).toISOString(),
      key_hash: hmac(key)
  }})
  return key
}

const findUser = async (email:string) => {
  return await prisma.people.findUnique({where: {email}})
}


export async function updatePassword(email: string, newPassword: string, key_hash: string) {
  let password_hash = await bcrypt.hash(newPassword, await bcrypt.genSalt())

  await prisma.password_reset_keys.delete({where:{key_hash}})
  return prisma.people.update({where:{email}, data:{password_hash}})
}
