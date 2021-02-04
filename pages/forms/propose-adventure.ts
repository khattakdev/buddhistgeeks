import h from 'react-hyperscript'
import { Box, FormBox, LabelBox, Seperator } from 'components/Layout'
import { Textarea, Input } from 'components/Form'
import { useApi } from 'src/apiHelpers'
import {SubmitFormMsg, SubmitFormResponse} from 'pages/api/submitForm'
import { Primary } from 'components/Button'
import { AccentImg } from 'components/Images'
import { useFormData } from 'src/hooks'

export default ()=>{
  let {state, form, reset} = useFormData({
    Name: "",
    Email: "",
    About: "",
    Experience: "",
    Timeline: "",
    Hours: "",
    Goals: "",
    Artifacts: "",
    Scheduling: ""
  })
  let[status, callApi] = useApi<SubmitFormMsg, SubmitFormResponse>([state])
  const onSubmit = (e:React.FormEvent) =>{
    e.preventDefault()
    callApi('/api/submitForm', {
      base: "appedbglZk1jTEyCS",
      data: state
    })
  }
  return status === 'success' ? h(Box, {style:{justifyItems:'center'}, gap:32}, [
    h(Box,{style:{textAlign: 'center', justifyItems: "center"}}, [
      h(AccentImg, {src: '/img/plane.gif', alt: "an animated gif of a paper airplane taking off" }),
      h('h1', "Thank You!"),
      h('p.big', `We'll get back to you soon! `),
    ]),
    h(Primary, {onClick: ()=>reset()}, "Submit another idea")
  ]) : h(Box, {ma: true, width: 640, gap:32}, [
    h(Box, [
      h('h1', "Propose a Learning Adventure"),
	  h('p.big', `Interested in joining Hyperlink's Learning Adventure Club? We'd love to hear what you have in mind!`),
	  h('p.big', `We love experiments. Also, projects that are ambitious and concrete :)`),
      h('p.big', `Submit the form below, and if it's a good fit, we'll invite you to join an upcoming cohort.`),
    ]),
    h(Seperator),

    h(FormBox, {gap: 64, onSubmit}, [
      h(Box, {gap:32}, [
        h(LabelBox, {gap:8}, [
          h('h3', "Your Name"),
          h(Input, {
            type: "text",
            ...form.Name
          })
        ]),
        h(LabelBox, {gap:8}, [
          h('h3', "Your Email"),
          h(Input, {
            type: "email",
            ...form.Email
          })
        ]),
        h(LabelBox,{gap:8}, [
          h('div', [
            h('h3', "What's your project about, in a sentence or two?" ),
            h('small',`For example: "I'm writing a book about personal librarianship" or "I'm doing a daily animation challenge"`),
          ]),
          h(Textarea, form.About)
		]),
		h(LabelBox, {gap:8},[
          h('div',[
            h('h3', "How experienced are you in this area? (Scale of 1 to 5)"),
            h('small', `Where 1 = "totally new thing for me" and 5 = "I've been doing this for years"`),
          ]),
          h(Input, form.Experience)
        ]),
        h(LabelBox,{gap:8}, [
          h('div', [
            h('h3', "What's your estimated project length / timeline?" ),
            h('small',`Is this a one-month project? A one-year project? Ongoing / TBD?`),
          ]),
          h(Input, form.Timeline)
        ]),
        h(LabelBox,{gap:8}, [
          h('div', [
            h('h3', "How many hours per week will you commit to working on it?" ),
            h('small',`Average is fine, but we'll expect some progress weekly. Be realistic!`),
          ]),
          h(Input, form.Hours)
        ]),
        h(LabelBox, {gap:8},[
          h('div',[
            h('h3', "What are your main goals for this project?"),
            h('small', `In a couple sentences: what do you hope to get out of this? What does success / completion look like?`),
          ]),
          h(Textarea, form.Goals)
		]),
		h(LabelBox, {gap:8},[
          h('div',[
            h('h3', "What might you make and share as an artifact?"),
            h('small', `For example: "I'll publish weekly reading notes on my blog" or "I'll share a daily Instagram post"`),
          ]),
          h(Textarea, form.Artifacts)
		]),
		h(LabelBox, {gap:8},[
          h('div',[
            h('h3', "When can you start, and what time works best?"),
            h('small', `For example: "I'd like to start in February and evenings EST are best" (this helps us plan future cohorts)`),
          ]),
          h(Textarea, form.Scheduling)
		]),

      ]),
      h(Primary, {type: "submit", status, style:{justifySelf: "right"}}, "Submit")
    ])
  ])
}
