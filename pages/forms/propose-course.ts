import h from 'react-hyperscript'
import { Box, FormBox, LabelBox, Seperator } from 'components/Layout'
import { Textarea, Input } from 'components/Form'
import { useApi } from 'src/apiHelpers'
import {SubmitFormMsg, SubmitFormResponse} from 'pages/api/submitForm'
import { Primary } from 'components/Button'
import { AccentImg } from 'components/Images'
import { useFormData } from 'src/hooks'

export default ()=>{
  let {state, reset, form} = useFormData({
    Name: "",
    Email: "",
    Topic: "",
    Structure: "",
    Participants: "",
    Cost: "",
    Artifacts: "",
    Vision: "",
    References: "",
    Questions: ""
  })
  let[status, callApi] = useApi<SubmitFormMsg, SubmitFormResponse>([state])
  const onSubmit = (e:React.FormEvent) =>{
    e.preventDefault()
    callApi('/api/submitForm', {
      base: "appR4eeCFwbJVZ2ij",
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
      h('h1', "Propose a Course"),
      h('p.big', `If you're interested in running a Course on Hyperlink, we'd love to hear what you have in mind!`),
      h('p.big', [
        `Courses on Hyperlink are developed in the `, 
        h('a', {href: "https://hyperlink.academy/courses/the-meta-course/1"}, `Meta Course`), 
        `.`
      ]),
      h('p.big', `We'll review your proposal and if it seems like a good fit, invite you to join an upcoming Meta Course cohort.`),
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
            h('h3', "What's the course about?" ),
            h('small',`In a few words, e.g. "Language construction workshop" or "How to build an online community"`),
          ]),
          h(Textarea, form.Topic)
        ]),
        h(LabelBox,{gap:8}, [
          h('div', [
            h('h3', "What do you imagine the structure looks like?" ),
            h('small',`In a few short paragraphs: what are the main learning goals? How long is it and how frequently does it meet? What's the workload? Initial thoughts on what the list of sessions could look like?`),
          ]),
          h(Textarea, form.Structure)
        ]),
        h(LabelBox,{gap:8}, [
          h('div', [
            h('h3', "Who do you imagine is the ideal participant?" ),
            h('small',`Who should take this course? Who should *not* take it?`),
          ]),
          h(Textarea, form.Participants)
        ]),
        h(LabelBox,{gap:8}, [
          h('div', [
            h('h3', "How much do you imagine it will cost?" ),
            h('small',`In USD. rough estimate fine for now; we can discuss further! Our pricing model: you set a price, Hyperlink takes a 20% platform fee, you keep 80%.`),
          ]),
          h(Input, form.Cost)
        ]),
        h(LabelBox,{gap:8}, [
          h('div', [
            h('h3', "What might the artifacts or output of the course look like?" ),
            h('small',`What are participants making or doing in the course? Any assignments or final projects in mind?`),
          ]),
          h(Textarea, form.Artifacts)
        ]),
        h(LabelBox,{gap:8}, [
          h('div', [
            h('h3', "Can you tell us a bit about yourself and your overall vision for the course?" ),
            h('small',`How does this fit with your work? Why are you the right person to teach it? How much time do you imagine spending on it? Any long-term ideas for how it might develop?`),
          ]),
          h(Textarea, form.Vision)
        ]),
        h(LabelBox, {gap:8},[
          h('div',[
            h('h3', "Anything else we should check out? (Optional)"),
            h('small', "Feel free to share your website, Twitter, or other links that might help illustrate what you have in mind!"),
          ]),
          h(Textarea, form.References)
        ]),
        h(LabelBox, {gap:8},[
          h('div',[
            h('h3', "Any questions for us? (Optional)"),
            h('small', "Let us know if you have further things you'd like to discuss about this idea, or courses on Hyperlink in general!"),
          ]),
          h(Textarea, form.Questions)
        ]),

      ]),
      h(Primary, {type: "submit", status, style:{justifySelf: "right"}}, "Submit")
    ])
  ])
}
