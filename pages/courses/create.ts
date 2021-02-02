import h from 'react-hyperscript'
import { useRouter } from 'next/router'
import { useState } from 'react'

import {  Input, Error, Info, Textarea, CheckBox} from 'components/Form'
import { Primary } from 'components/Button'
import { LabelBox, FormBox } from 'components/Layout'

import { useApi } from 'src/apiHelpers'
import { useUserData } from 'src/data'
import { CreateCourseMsg, CreateCourseResponse } from 'pages/api/courses'

const CreateCourse = ()=> {
  let {data: user} = useUserData()
  let router = useRouter()
  let [formData, setFormData] = useState({
    name: '',
    description: '',
    prerequisites: '',
    duration: "",
    cost: 5,
    type: 'course' as 'course' | 'club',
    maintainers: [] as string[]
  })

  let [status, callCreateCourse] = useApi<CreateCourseMsg, CreateCourseResponse>([formData])

  if(user === false) router.push('/')
  if(user &&  user.admin === false) router.push('/dashboard')

  const onSubmit = async (e:React.FormEvent) => {
    e.preventDefault()
    await callCreateCourse('/api/courses', {...formData})
  }

  return h('div', [
    h('h1', 'Create a New Course'),
    status === 'error' ? h(Error, 'An error occured') : null,
    status === 'success' ? h(Info, 'Course created!') : null,
    h(FormBox, {onSubmit}, [
      h(CheckBox, {style:{marginTop: '16px'}}, [
        h(Input, {
          type: 'checkbox',
          checked: formData.type === 'club',
          onChange: e=> setFormData({...formData, type: e.currentTarget.checked ? 'club' : 'course'})
        }),
        h('h4', 'Club? '),
      ]),
      h(LabelBox, {gap:8}, [
        h('h4', 'Name'),
          h(Input, {
            required: true,
            type: 'text',
            maxLength: 50,
            value: formData.name,
            onChange: e => setFormData({...formData, name: e.currentTarget.value})
          }),
      ]),
      h(LabelBox, {gap:8}, [
        h('h4', 'Description'),
          h(Textarea, {
            required: true,
            maxLength: 200,
            value: formData.description,
            onChange: e => setFormData({...formData, description: e.currentTarget.value})
          }),
      ]),
      h(LabelBox, {gap:8}, [
        h('h4', 'Duration'),
        h(Input, {
          type: 'text',
          value: formData.duration,
          onChange: e=> setFormData({...formData, duration: e.currentTarget.value})
        })
      ]),
      h(LabelBox, {gap:8}, [
        h('h4', 'Prerequisites'),
        h(Textarea, {
          value: formData.prerequisites,
          onChange: e=> setFormData({...formData, prerequisites: e.currentTarget.value})
        })
      ]),
      h(LabelBox, {gap:8}, [
        h('h4', 'Cost (USD)'),
        h(Input, {
          required: true,
          type: 'number',
          min: '5',
          max: '1000',
          value: formData.cost,
          onChange: e=> setFormData({...formData, cost: parseInt(e.currentTarget.value)})
        })
      ]),
      h(LabelBox, {gap:8}, [
        h('h4', 'Maintainers'),
        h(Input, {
          required: true,
          type: 'email',
          multiple: true,
          onChange: e=> setFormData({...formData, maintainers: e.currentTarget.value.split(',').map(x=>x.trim())})
        })
      ]),
      h(Primary, {status, type: 'submit'}, 'Submit')
    ])
  ])
}

export default CreateCourse
