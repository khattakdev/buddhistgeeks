import h from 'react-hyperscript'
import { coursesQuery } from 'pages/api/courses'
import { InferGetStaticPropsType } from 'next'
import {CourseAndClubList} from 'components/pages/CourseAndClubList'

type Props = InferGetStaticPropsType<typeof getStaticProps>
export default function Courses(props:Props) {
  return h(CourseAndClubList, {initialData:props, type: 'club' as const})
}

export const getStaticProps = async () => {
  let courses = await coursesQuery({type: 'club'})
  return {props: {courses}, revalidate: 1} as const
}
