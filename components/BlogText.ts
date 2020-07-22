import styled from '@emotion/styled'
import h from 'react-hyperscript'
import Markdown from 'react-markdown'
import {colors} from './Tokens'

export default (props:{source:string}) => h(BlogTextStyles, {}, h(Markdown, props))
export const BlogTextStyles = styled('div')`

h1:first-of-type { margin-top: 0 !important; margin-left: 0 !important; }

h1 {
  margin-bottom: 1rem;
  font-family: 'Roboto Mono', monospace;
  font-weight: bold;
  font-size: 2.8rem;

}

h2 {
  margin-top: 3rem;
  margin-bottom: 1rem;
  font-family: 'Lato', sans-serif;
  font-weight: 700;
  font-size: 2.1rem; 
  font-kerning: normal;
}

h3 {
  margin-top: 2rem;
  margin-bottom: .75rem;
  font-family: 'Lato', sans-serif;
  font-weight: 900;
  font-size: 1.35rem;
  font-kerning: normal;


}

h4 {
  margin-top: 1.5rem;
  margin-bottom: .6rem;
  font-family: 'Lato', sans-serif;
  font-weight: 900;
  font-size: 1.25rem;
  font-kerning: noral;
  color: ${colors.textSecondary};
}


p {
  margin-bottom: 1rem;
  margin-top: 0;
  font-size: 1.25rem;
  line-height:155%;
  font-kerning: normal;

}

/* setting the style for numbered list */
ol {
  list-style: none;
  counter-reset: number-list;
}
ol li {
  counter-increment: number-list;
}
ol li::before {
  content: counter(number-list) ". ";
  display: inline-block; 
  width: 1rem; 
  margin-left: -1.5em;
  margin-right: 0.5em; 
  text-align: right; 
}

li {
  margin-bottom: .333rem;
  margin-top: .333rem;
  font-size: 1.25rem;
  line-height: 155%;

}
`