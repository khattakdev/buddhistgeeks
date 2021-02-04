import crypto from 'crypto'
import querystring from 'querystring'

let headers = {
      "Api-Key": process.env.DISCOURSE_API_KEY || '',
      "Api-Username": process.env.DISCOURSE_API_USERNAME || '',
    }

export let DISCOURSE_URL = process.env.NEXT_PUBLIC_DISCOURSE_URL

let fetchWithBackoff = async (url: Parameters<typeof fetch>[0], options:Parameters<typeof fetch>[1], exponent: number = 1):ReturnType<typeof fetch> => {
  let result = await fetch(url, options)
  if(result.status === 429) {
    let value = 1000 * (2**exponent)
    await new Promise((resolve)=>{
      let backoff = Math.min(value + Math.floor(Math.random()*value), 64000)
      setTimeout(()=>resolve(), backoff)
    })
    return fetchWithBackoff(url, options, exponent+1)
  }
  return result
}

export type Category = {
  topic_list: {
    topics: Array<{
      category_id: number
      id: string
      pinned: boolean
      tags: string[]
    }>
  }
}

export async function createGroup(group:{
  name: string,
  visibility_level: number,
  owner_usernames: string | string[],
  mentionable_level?: number,
  messageable_level?: number
}) {
  if(typeof group.owner_usernames !== 'string') group.owner_usernames = group.owner_usernames.join(',')
  let result = await fetchWithBackoff(`${DISCOURSE_URL}/admin/groups`, {
    method: 'POST',
    headers: {
      ...headers,
      "Content-Type": 'application/json; charset=utf-8'
    },
    body: JSON.stringify({group})
  })

  if(result.status !== 200) {
    console.log(await result.text())
    return false
  }
  return await result.json() as {basic_group: {id: number}}
}

export async function updateTopic(topic:string, input: {category_id: number, title: string, raw: string, tags: string[]}, username?: string) {
  // Update the title
  await fetch (`${DISCOURSE_URL}${topic}`, {
    method: "PUT",
    headers:{
      "Content-Type": 'application/json; charset=utf-8',
      ...headers
    },
    body: JSON.stringify({
      tags: input.tags,
      title: input.title
    })
  })

  // Update the content
  let topicData = await (await fetchWithBackoff(`${DISCOURSE_URL}${topic}.json`, {headers})).json()
  let postID = topicData.post_stream.posts[0].id
  await fetch (`${DISCOURSE_URL}/posts/${postID}`, {
    method: "PUT",
    headers:{
      "Content-Type": 'application/json; charset=utf-8',
      ...headers
    },
    body: JSON.stringify({
      post: {
        raw: input.raw
      }
    })
  })

  // Update the owner
  if(username) await fetchWithBackoff(`${DISCOURSE_URL}/t/${topicData.id}/change-owner`, {
    method: "POST",
    headers: {
      "Content-Type": 'application/json; charset=utf-8',
      ...headers
    },
    body: JSON.stringify({post_ids: [postID], username})
  })
}

export async function createTopic(input:{title: string, category: number | string, raw: string, tags?: string[]}, asUser?: string) {
  let result = await fetchWithBackoff(`${DISCOURSE_URL}/posts.json`, {
    method: "POST",
    headers: {
      "Content-Type": 'application/json; charset=utf-8',
      ...headers,
      "Api-Username": asUser || headers["Api-Username"]
    },
    body: JSON.stringify(input)
  })
  if(result.status !== 200) {
    console.log(await result.text())
  }
  if(result.status === 200)  return await result.json() as {id: string, topic_id: number}
}

export const createCategory = async (name: string, options?: {
  slug?: string,
  permissions?: {[key:string]:number},
  parent_category_id?: number,
  show_subcategory_list?: boolean,
  subcategory_list_style?: "rows_with_featured_topics",
  default_list_filter?:"none"
}) => {
  let result = await fetchWithBackoff(`${DISCOURSE_URL}/categories.json`, {
    method: 'POST',
    headers: {
      ...headers,
      "Content-Type": 'application/json; charset=utf-8'
    },
    body: JSON.stringify({name, color: '0088CC', text_color: 'FFFFFF', ...options})
  })
  if(result.status === 200) return (await result.json()).category as {id: number, topic_url: string}
  console.log(await result.text())
  return false as const
}

export async function updateGroup(id: number, name: string) {
  let result = await fetchWithBackoff(`${DISCOURSE_URL}/g/${id}.json`, {
    method: "PUT",
    headers: {
      ...headers,
      "Content-Type": 'application/json; charset=utf-8'
    },
    body: JSON.stringify({name})
  })
  if(result.status !== 200) console.log(await result.text())
  else return true
}

export async function updateCategory (id: string | number, options: {permissions?: {[key:string]: number}, name: string, slug?: string}) {
  let result = await fetchWithBackoff(`${DISCOURSE_URL}/categories/${id}`, {
    method: "PUT",
    headers: {
      ...headers,
      "Content-Type": 'application/json; charset=utf-8'
    },
    body: JSON.stringify({...options, color: '0088CC', text_color: 'FFFFFF'})
  })
  if(result.status !== 200) console.log(await result.text())
  else return true
}
export async function getCategory(path: string | number){
  let res = await fetchWithBackoff(`${DISCOURSE_URL}/c/${path}.json`, {
    method: 'GET',
    headers: {
      ...headers,
      "Content-Type": 'application/json; charset=utf-8',
    },
  })
  if(res.status === 200){
    let category = await res.json() as Category
    return category
  }
  else console.log(await res.text())
}

export const getUsername = async (userId:string):Promise<string | undefined> => {
  let result = await fetchWithBackoff(`${DISCOURSE_URL}/u/by-external/${userId}.json`, {
    method: "GET",
    headers
  })

  if(result.status === 200) {
    return (await result.json()).user.username as string
  }
  else return
}

export const getGroupId = async (groupName:string) => {
  let result = await fetchWithBackoff(`${DISCOURSE_URL}/groups/${groupName}.json`, {
    method: "GET",
    headers
  })
  if(result.status === 200) return (await result.json()).group.id
  return undefined
}

export const addMember = async (groupId:number, username: string) => {
  let result = await fetchWithBackoff(`${DISCOURSE_URL}/groups/${groupId}/members.json`, {
    method: "PUT",
    headers: {
      ...headers,
      "Content-Type": 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      usernames: username
    })
  })
  return result.status  === 200
}

export const getTaggedPost = async (c: string | number, tag: string) => {
  let res = await fetchWithBackoff(`${DISCOURSE_URL}/c/${c}.json`, {
    method: 'GET',
    headers: {
      ...headers,
      "Content-Type": 'application/json; charset=utf-8',
    },
  })

  if(res.status !== 200) console.log(await res.text())
  let category = await res.json() as Category
  let topicID = category.topic_list.topics.find((topic) => topic.tags.includes(tag))?.id
  if(!topicID) return {text: '', id: ''}
  let topicRequest = await fetchWithBackoff(`${DISCOURSE_URL}/raw/${topicID}`, {headers})
  return {text: await topicRequest.text(), id: topicID}
}

export const makeSSOPayload = (params: {[key:string]: string}) => {
  let payload = (Buffer.from(querystring.stringify(params))).toString('base64')
  const sig = crypto.createHmac('sha256', process.env.DISCOURSE_SECRET || '');
  sig.update(payload)

  let result = querystring.stringify({
    sso:payload,
    sig: sig.digest('hex')
  })
  return result
}

export const syncSSO = async (params: {[key:string]: string})=>{
  let payload = (Buffer.from(querystring.stringify(params))).toString('base64')
  const sig = crypto.createHmac('sha256', process.env.DISCOURSE_SECRET || '');

  sig.update(payload)
  return fetchWithBackoff(`${DISCOURSE_URL}/admin/users/sync_sso`, {
    method: "POST",
    headers: {
      "Api-Key": process.env.DISCOURSE_API_KEY || '',
      "Api-Username": 'system',
      "Content-Type": 'application/json; charset=utf-8'
    },
    body: JSON.stringify({
      sso: payload,
      sig: sig.digest('hex')
    })
  })
}

export async function createPost(params:{topic_id: number,raw:string}) {
  let result = await fetchWithBackoff(`${DISCOURSE_URL}/posts.json`, {
    method: "POST",
    headers: {
      "Content-Type": 'application/json; charset=utf-8',
      ...headers,
      "Api-Username":'system'
    },
    body: JSON.stringify(params)
  })
  console.log(result)
}
