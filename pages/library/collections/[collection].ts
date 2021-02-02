import h from 'react-hyperscript'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { InferGetStaticPropsType } from 'next'
import { Library, collections } from 'pages/library'
import ErrorPage from 'pages/404'
import { Box, FlexGrid } from 'components/Layout'
import { Card } from 'components/Cards'
import Link from 'next/link'
import { BackButton } from 'components/Button'
import styled from '@emotion/styled'
import { Pill } from 'components/Pill'

type Props = InferGetStaticPropsType<typeof getStaticProps>

const WrappedLibraryCollectionsPage = (props: Props)=>props.notFound ? h(ErrorPage) : h(LibraryCollections, props)
export default  WrappedLibraryCollectionsPage
function LibraryCollections(props:Extract<Props, {notFound: false}>){
  if(!props.collection) return h('div', '')
  return h(Box, {gap: 64}, [
    h(Box, {width: 640}, [
      h(Box, {gap: 8},[
        h(BackButton, {href: "/library"}, 'all Collections'),
        h('h1', props.collection.title),
      ]),
      h('p.big', props.collection.description),
    ]),
    h(FlexGrid, {min:250, mobileMin: 250}, props.posts
      .sort((a, b)=>{
        return new Date(a.date) < new Date(b.date) ? 1 : -1
      })
      .map(p=>h(Link, {href:p.path}, h(Card, {style:{height:'min-content'}}, [
        h(Box, {gap: 16},[
          h(Box, {gap: 8}, [
            h('h3', p.title),
            new Date(p.date) > new Date((new Date()).getTime() - 60 * 60 * 24 * 7 * 1000) ? h(NewPill, "new!") : null,
            // h('span.textSecondary', `${p.author} | ${prettyDate(p.date)}`)
          ]),
          h('p', p.description)
        ])

      ])))
     )
])
}

export const getStaticProps = async (ctx:any) =>{
  let name = ctx.params.collection
  console.log(name)
  let collection = collections[name as keyof typeof collections]
  if(!collection) return {props:{notFound: true}} as const

  let posts = fs.readdirSync('./pages/library').map((file)=>{
    if(fs.lstatSync(path.join('./pages/library/', file)).isDirectory()) return
    let content = fs.readFileSync('./pages/library/'+file)
    let {data} = matter(content)
    return {...data, path: '/library/'+file.slice(0, -4)} as Library
  }).filter(p=>{
    return p?.tags.includes(name)
  })

  return {props: {collection, posts:posts as Library[], notFound: false}} as const
}

export const getStaticPaths = async () => {
  let paths = Object.keys(collections).map(name=>{
    return {
      params: {collection: name}
    }
  })
  return {paths, fallback: false}
}

// pill to tag new posts - published in the last 7 days
const NewPill = styled(Pill)`
    background-color: green;
    color: white;
`
