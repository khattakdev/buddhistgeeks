import useSWR from 'swr'
import {callApi, Success} from './apiHelpers'
import { UserCohortsResult, WhoAmIResult, UserCoursesResult} from '../pages/api/get/[...item]'
import { CohortResult } from '../pages/api/cohorts/[cohortId]'
import { CourseDataResult } from '../pages/api/courses/[id]'
import { ProfileResult } from '../pages/api/people/[id]'
import { CourseResult } from '../pages/api/courses'
import { GetDiscountsResult } from 'pages/api/courses/[id]/discounts'
import { GETEventResult } from 'pages/api/events/[id]'

export type User = Success<WhoAmIResult>
export const useUserData = ()=>{
  return useSWR('/api/get/whoami', async (api) => {
    let res = await callApi<null, WhoAmIResult>(api)
    return res.result
  })
}

export const useProfileData = (username?:string, initialData?:Success<ProfileResult>)=>{
  return useSWR(username ? '/api/people/'+username : null, async api =>{
    let res = await callApi<null, ProfileResult>(api)
    if(res.status===200) return res.result
    else return false
  }, {initialData})
}

export type Course = Success<CourseDataResult>
export const useCourseData = (id?: number | string, initialData?:Success<CourseDataResult>) => {
  return useSWR(id ? '/api/courses/' + id : null, async api => {
    let res = await callApi<null, CourseDataResult>(api)
    if(res.status === 200) return res.result
  }, {initialData})
}

export type Event = Success<GETEventResult>
export const useEventData = (id: number, initialData?:Event) => useSWR(`/api/events/${id}`, async api => {
  let res = await callApi<null, GETEventResult>(api)
  if(res.status === 200) return res.result
  else return false
}, {initialData})

export type Cohort = Success<CohortResult>
export const useCohortData = (cohort?: number, initialData?:Success<CohortResult>) => {
  return useSWR(cohort ? `/api/cohorts/${cohort}`:null, async api => {
    let res = await callApi<null, CohortResult>(api)
    if(res.status === 200) return res.result
    else return false
  }, {initialData, revalidateOnMount: true})
}

export const useUserCohorts = () => {
  return useSWR('/api/get/user_cohorts', async(api) => {
    let res = await callApi<null, UserCohortsResult>(api)
    if(res.status===200) return res.result
  })
}

export const useUserCourses = ()=>{
  return useSWR('/api/get/user_courses', async(api)=>{
    let res=await(callApi<null, UserCoursesResult>(api))
    if(res.status===200) return res.result
  })
}

export type Courses = Success<CourseResult>
export const useCourses = (options?:Partial<{type: "course" | "club", initialData?:Success<CourseResult>}>) => {
  return useSWR(`/api/courses${options?.type ? `?type=${options.type}`: ''}`, async (api) => {
    let res = await callApi<null, CourseResult>(api)
    return res.result
  }, {initialData:options?.initialData})
}

export const useDiscounts = (id: number) => {
  return useSWR(`/api/courses/${id}/discounts`, async (api)=>{
    let res = await callApi<null, GetDiscountsResult>(api)
    if(res.status===200) return res.result
  })
}
