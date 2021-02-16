import { loadStripe } from '@stripe/stripe-js/pure'

export const prettyDate = (str: string) =>  {
  let date = new Date(str)
  let today = new Date()
  if(date.getDate()===today.getDate() &&
    date.getMonth()===today.getMonth() &&
    date.getFullYear()===today.getFullYear()) return "Today"
  return date.toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})
}

export function dateFromDateAndTimeInputs(date: string, time: string){
  let dateParts = date.split('-').map(x=>parseInt(x))
  let timeParts = time.split(':').map(x=>parseInt(x))
  return new Date(dateParts[0], dateParts[1] -1, dateParts[2], timeParts[0], timeParts[1])
}

export const slugify = (str:string) => {
  var specials = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~’]/g
  return str.trim()
    .replace(specials, '')
    .replace(/\s/g, '-')
    .toLowerCase()
}

export const usernameValidate = (s:string) => /^[a-zA-Z0-9_.\-]{3,15}$/.test(s)

export function getTimeBetween(d1: Date, d2:Date) {
  return ((d2.getTime() - d1.getTime()) / (1000 * 60 * 60)).toFixed(1)
}


let stripePromise:ReturnType<typeof loadStripe>
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!)
  }
  return stripePromise
}

export const sortByDateAndName = (a:{start_date: string, name: string}, b:{start_date:string, name: string}) => {
  if(a.start_date === b.start_date) return a.name > b.name ? 1 : -1
  return a.start_date > b.start_date ? 1 : -1
}

export const cohortName = (name: string)=>isNaN(parseInt(name)) ? name  :`Cohort #${name}`

export function formHelper<S>(state:S, setState:(s:S)=>void) {
  return Object.keys(state).reduce((acc, key)=> {
    let value =state[key as keyof S]
    acc[key as keyof S] = {
      value,
      onChange: (e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>setState({
        ...state,
        [key]: typeof value === 'number' ? parseInt(e.currentTarget.value) : e.currentTarget.value
      })
    }
    return acc
  },  {} as {[k in keyof S]: {value: S[k], onChange: (e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>void}})
}
