import { Children } from "react";
import h from "react-hyperscript";
import styled from "@emotion/styled";
import Link from "next/link";
import { ContentTextStyles } from "./ContentText";
import { AccentImg } from "./Images";
import { colors, Tablet } from "./Tokens";
import { useRouter } from "next/router";

const Pages: { [k: string]: string } = {
  "The Manual": "/manual",
  Learners: "/manual/learners",
  Facilitators: "/manual/facilitators",
  Maintainers: "/manual/maintainers",
  "Creating a Course": "/manual/courses",
  Infrastructure: "/manual/infrastructure",
};

const ManualPage: React.SFC<{ image?: string }> = (props) => {
  let router = useRouter();
  let TOC = Children.toArray(props.children)
    .filter((x) => {
      let component = x as React.ReactElement;
      let tag = component?.props?.originalType;
      if (typeof tag === "string") {
        return tag === "h2";
      }
      return false;
    })
    .map((x) => {
      let component = x as React.ReactElement;
      return h(component.props.originalType, [
        h(
          "a.notBlue",
          { href: "#" + component.props.id },
          component.props.children
        ),
      ]);
    });

  return h(Container, {}, [
    h("div", [
      h(TOCContainer, {}, [
        ...Object.keys(Pages).flatMap((page) => {
          return [
            h(
              Link,
              { href: Pages[page] },
              h("a.notBlue", {}, h("h1", { class: Pages[page].slice(1) }, page))
            ),
            Pages[page] === router.pathname ? h("div", TOC) : null,
          ];
        }),
        h(AccentImg, {
          height: 64,
          width: 64,
          src: "/img/manual.gif",
          alt: "A gif of a spellbook floating in the air",
          style: { marginTop: 32 },
        }),
      ]),
    ]),
    h(ContentTextStyles, [props.children as React.ReactElement]),
  ]);
};

export default ManualPage;

let Container = styled("div")`
  display: grid;
  grid-gap: 64px;
  grid-template-columns: auto auto;

  ${Tablet} {
    display: block;
  }
`;

let TOCContainer = styled("div")`
  position: sticky;
  top: 32px;
  display: grid;
  padding-right: 32px;
  padding-bottom: 16px;
  border-right: 2px solid;
  text-align: right;
  justify-items: right;

  ${Tablet} {
    text-align: left;
    justify-items: left;
    padding-left: 32px;
    border-right: none;
    border-left: 2px solid;
  }

  h1 {
    font-size: 1.375rem;
    padding-top: 16px;
    font-family: Lato;
  }

  h1.manual {
    font-size: 2em;
    font-family: Roboto Mono;
  }

  h2 {
    font-size: 1rem;
    font-weight: normal;
    padding-top: 4px;
    font-family: Lato;
  }

  h3,
  h4,
  h5,
  h6 {
    font-weight: normal;
    font-size: 1rem;
    color: ${colors.textSecondary};
  }

  a {
    text-decoration: none;
  }
`;
