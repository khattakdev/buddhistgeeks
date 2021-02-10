import { NextApiRequest, NextApiResponse} from 'next'
import * as Sentry from '@sentry/node'
import { useState, useEffect} from 'react'
import useSWR from 'swr'

export type ResultType<T extends (...args:any)=> any> = PromiseReturn<ReturnType<T>>
export type Request = NextApiRequest
export type Success<T extends Result> = Extract<T, {status: 200}>['result']
export type Errors<T extends Result> = Exclude<T, {status: 200}>

type Handler = (req:Request) => Promise<Result>
type PromiseReturn<T> = T extends PromiseLike<infer U> ? U : T

type Result = {
  status: number,
  result: string | object | null | boolean
  headers?: {
    [key: string]: string | number | string[]
  }
}

type Methods = "POST" | "GET" | "PUT" | "DELETE"

export const APIHandler = (handler: Handler | Partial<{POST: Handler, GET: Handler, PUT: Handler, DELETE: Handler}>) => {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN});
  }
  return async (req:NextApiRequest, res: NextApiResponse) => {
    let result
    try {
      if(typeof handler === 'object') {
        let method = req.method as Methods
        let methodHandler = handler[method]
        if(!methodHandler) {
          res.status(404).end()
          return
        }
        result = await methodHandler(req)
      }
      else {
        result = await handler(req)
      }
    }
    catch(e) {
      if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        Sentry.captureException(e, {contexts: {headers: req.headers}})
        await Sentry.flush(2000)
      }
      console.log(e)
      return res.status(500).end()
    }

    if(result.headers) {
      for(let header of Object.keys(result.headers)) {
        res.setHeader(header, result.headers[header])
      }
    }
    if(result.status!==200) console.log(result.result)
    if(typeof result.result !== 'object') return res.status(result.status).send(result.result)
    return res.status(result.status).json(result.result)
  }
}

export const multiRouteHandler = (query:string, handlers:{[key:string]: Handler}) => {
  return APIHandler(async (req) => {
    let route = (typeof req.query[query] === 'string')
                 ? req.query[query] as string
                 : req.query[query][0]
    return handlers[route](req)
  })
}

export async function callApi<Msg extends object | string | null, R extends Omit<Result, 'headers'>> (endpoint:string, msg?: Msg, method?: Methods){
    let result = await fetch(endpoint, {
      method: method ? method : msg ? "POST" : "GET",
      headers: {
        'Content-type': (typeof msg === 'object') ? 'application/json' : 'text/html'
      },
      body: (typeof msg === 'string') ? msg : JSON.stringify(msg)
    })

    return {
      status: result.status,
      result: result.headers.get('Content-type')?.includes('application/json')
        ? await result.json()
        : await result.text()
    } as R
}

export type Status = 'normal' | 'error' | 'loading' | 'success'
export function useApi<Msg extends object | string | null, R extends Omit<Result, 'headers'>>(deps: any[], successCallback?: (result: Extract<R, {status:200}>['result'])=> any) {
  let [state, setState] = useState<Status>('normal')
  useEffect(()=> setState('normal'), deps)
  let call= async (path: string, msg?: Msg, method?: Methods) => {
    setState('loading')
    let res = await callApi<Msg, R>(path, msg, method)
    if(res.status === 200) {
      if(successCallback) await successCallback(res.result)
      setState('success')
    }
    else setState('error')
    return res
  }
  return [state, call, setState] as const
}

export function useApiData<R extends Omit<Result, 'headers'>>(path?: string, initialData?:R) {
  return useSWR<Success<R>, Errors<R>>(path ? path : null, async (path)=>{
    let res = await callApi<null, R>(path)
    if(res.status = 200) return res.result
    return res
  }, {initialData})
}
