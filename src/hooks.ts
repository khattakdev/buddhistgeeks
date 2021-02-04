import {useRef, useEffect, useState} from 'react'
import { formHelper } from './utils';
export const useDebouncedEffect = (callback:Function, delay:number, deps:any[])  => {
  const firstUpdate = useRef(true);
  useEffect(()=>{
    if(firstUpdate.current) {
      firstUpdate.current = false
      return
    }
    const handler = setTimeout(()=>{
      callback()
    }, delay)

    return ()=>{
      clearTimeout(handler)
    }
  }, [delay, ...deps])
}

export const useMediaQuery = (query: string) => {
  let [match, setMatch] = useState(false)
  useEffect(()=>{
    let mediaQuery = window.matchMedia(query)
    setMatch(mediaQuery.matches)
    let listener = ()=>{
      setMatch(mediaQuery.matches)
    }
    mediaQuery.addListener(listener)
    return ()=> mediaQuery.removeListener(listener)
  },[query])
  return match
}

export function useFormData<T extends {[key:string]: string | null | number | object | boolean}> (initialState:T, update:any[]=[]) {
  let [state, setState] = useState(initialState)
  useEffect(()=>{
    setState(initialState)
  }, update)
  let form = formHelper(state, setState)
  return {
    state,
    setState,
    changed: Object.keys(initialState).reduce((acc, key)=>acc || initialState[key] !== state[key], false),
    form,
    reset:()=>setState(initialState)
  } as const
}
