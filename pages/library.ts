import h from 'react-hyperscript'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { InferGetStaticPropsType } from 'next'
import Link from 'next/link'

import { Box, FlexGrid } from 'components/Layout'
import { Card } from 'components/Cards'
// import { prettyDate } from 'src/utils'
import { Pill } from 'components/Pill'
import {RSS} from 'components/Icons'
import styled from '@emotion/styled'
import { Info } from 'components/Form'

export type  Library = {
  title:string,
  author:string,
  date:string,
  path: string,
  description:string,
  tags:string[]
}

export const collections = {
  "announcement": {
    title: "Announcements",
    description: "New courses, feature notes, upcoming events, and other Hyperlink news.",
  },
  "learning-design": {
    title: "Learning Design",
    description: "Essays and guides about aspects of creating great learning experiences."
  },
  "bookshelf": {
    title: "Bookshelf",
    description: "Highlighting and reviewing our favorite books on learning and pedagogy.",
  },
  // "changelog": {
  //   title: "Changelog",
  //   description: "Behind the scenes on Hyperlink development.",
  // },
  "interviews": {
    title: "Interviews",
    description: "Conversations with amazing teachers and learners.",
  },
  // "resources": {
  //   title: "Resources",
  //   description: "Our favorite projects, websites, syllabi, and other learning resources.",
  // },
}

//the Hyperlink Library layout is defined here

type Props = InferGetStaticPropsType<typeof getStaticProps>
const Library = (props:Props) => {
  return h(Box, {gap: 32}, [
    h(Box, {gap: 32, h: true, style:{display:"flex", flexWrap:"wrap"}}, [
      h('h1', 'Hyperlink Library'),
      h('a', {href:'/rss.xml', style:{alignSelf: 'center'}}, RSS),
      h('a', {href:'/library/latest', style:{alignSelf: 'center', float: 'right'}}, 'chronological feed'),
    ]),
    h('p.big', `Welcome to our internet center for teaching and learning — enjoy browsing the collections!`),
    h(Info, [
      `📓 For a general introduction to Hyperlink and overview of how the platform works, please read the `,
      h('a', {href: `/manual`}, `Hyperlink Manual`),
      `.`
    ]),
    ...Object.keys(collections).flatMap(slug=>{
      let collection = collections[slug as keyof typeof collections]
      let posts = props.posts.filter(p=>p.tags.includes(slug)).sort((a, b)=>{
        return new Date(a.date) < new Date(b.date) ? 1 : -1
      })
      return [
        h(Box, {gap: 32}, [
          h(Box, {gap:8, width: 640}, [
            h('h2', collection.title),
            h('p.big', collection.description),
            h(Link, {href: "/library/collections/"+slug}, h('a', `See all posts (${posts.length})`))
          ]),
          h(FlexGrid, {min:250, mobileMin: 200},posts.slice(0,3).map(p=>h(Link, {href:p.path, passHref: true}, h(Card, {style:{height:'min-content'}}, [
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
        ]),
        h('hr')
      ]
    }).slice(0,-1),
  ])
}

export const getStaticProps = async () =>{
  let posts = fs.readdirSync('./pages/library').map((file)=>{
    if(fs.lstatSync(path.join('./pages/library/', file)).isDirectory()) return
    let content = fs.readFileSync('./pages/library/'+file)
    let {data} = matter(content)
    return {...data, path: '/library/'+file.slice(0, -4)} as Library
  }).filter(x=>x!==undefined)

  return {props: {posts:posts as Library[]}} as const
}

export default Library

// pill to tag new posts - published in the last 7 days
const NewPill = styled(Pill)`
    background-color: green;
    color: white;
`

// // To add new tag types, add them to this object. Add the tag type and a color the tag should be.
// const tagColors:{[key: string]:string | undefined} = {
//     'announcement': '#cc2288',
//     'book-review': '#cc3322',
//     'learning-design': '#11aacc',
//     'hyperlink-meta': '#1d44d6',
//     'stargazing': '#6B8648'
// }

// // This is a function that creates tags with the appropriate tag type and color based on the list above.
// const Tag = styled(Pill) <{tagType: string}>`
//     background-color: ${props => tagColors[props.tagType] || colors.grey35};
//     color: white;
//     &::after{
//         content: "${props => props.tagType}";
//     }
// `
