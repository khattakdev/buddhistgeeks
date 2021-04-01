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
    Cost: "",
    Vision: "",
    References: "",
    Questions: ""
  })
  let[status, callApi] = useApi<SubmitFormMsg, SubmitFormResponse>([state])
  const onSubmit = (e:React.FormEvent) =>{
    e.preventDefault()
    callApi('/api/submitForm', {
      base: "appynJJHLWE6UOG6Z",
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
      h('h1', "On Deck Course Creators — welcome to Hyperlink!"),
	  h('p.big', ``),
      h('p.big', `If you're interested in running a course on Hyperlink, we'd love to hear what you have in mind.`),
	  h('p.big', `we're glad to offer ODCC Fellows:`),
	  h('ul', [
		  h('li', "1-hour consultation to talk about your course & get to know each other"),
		  h('li', "Priority onboarding to help you launch on Hyperlink"),
	  ]),
      h('p.big', `Fill out this form to tell us a bit about yourself and your course. We'll get back to you soon to find a time to chat!`),
    ]),
	h('p.big', [
        `Learn more about `,
        h('a', {href: "https://hyperlink.academy/create"}, `how Hyperlink works`),
		` and `,
		h('a', {href: "mailto:contact@hyperlink.academy"}, `reach out with any questions`),
        `.`
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
            h('small',`Title or a few words, e.g. "Language Construction Workshop" or "How to build a conlang"`),
          ]),
          h(Input, {
            type: "text",
            ...form.Topic
          })
        ]),
        h(LabelBox,{gap:8}, [
          h('div', [
            h('h3', "Can you share an outline of what the course looks like?" ),
            h('small',`What are the core learning goals? Length and structure? Ideal participants? Artifacts or outcomes?`),
			h('small',`A few short paragraphs…or a link to a draft document works too!`),
          ]),
          h(Textarea, form.Structure)
        ]),
        h(LabelBox,{gap:8}, [
          h('div', [
            h('h3', "How much do you imagine it will cost?" ),
            h('small',`In USD. Estimate is fine for now; we can discuss further. Our pricing model: you set course tuition, Hyperlink takes a 20% platform fee, you keep 80%.`),
          ]),
          h(Input, form.Cost)
        ]),
        h(LabelBox,{gap:8}, [
          h('div', [
            h('h3', "Who are you? What's your vision for the course?" ),
            h('small',`How does this fit with your work? Why are you the right person to teach it? Any long-term plans?`),
          ]),
          h(Textarea, form.Vision)
        ]),
        h(LabelBox, {gap:8},[
          h('div',[
            h('h3', "Anything else we should check out? (Optional)"),
            h('small', "Feel free to share your website, Twitter, or other links that might help us get to know you and your work."),
          ]),
          h(Textarea, form.References)
        ]),
        h(LabelBox, {gap:8},[
          h('div',[
            h('h3', "Any questions for us? (Optional)"),
            h('small', "Let us know any particular things you'd like to discuss about this course, or Hyperlink in general!"),
          ]),
          h(Textarea, form.Questions)
        ]),

      ]),
      h(Primary, {type: "submit", status, style:{justifySelf: "right"}}, "Submit")
    ])
  ])
}
