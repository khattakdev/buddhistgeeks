import h from "react-hyperscript";
import { Children, useState } from "react";
import styled from "@emotion/styled";

import { Box, FormBox, LabelBox } from "./Layout";
import { ContentTextStyles } from "./ContentText";
import { Tablet, colors } from "./Tokens";
import { BackButton, Secondary, Primary } from "./Button";
import { useApi } from "src/apiHelpers";
import {
  NewsletterSignupMsg,
  NewsletterSignupResponse,
} from "pages/api/signup/[action]";
import { Input, Info } from "./Form";
import Head from "next/head";

type Props = {
  title: string;
  description: string;
  date: string;
  author: string;
  toc?: boolean;
  living?: boolean;
  topic?: string;
};

export const LibraryLayout: React.FC<Props> = (props) => {
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

  return h("div", [
    h(Head, {
      children: [
        h("meta", {
          key: "titile",
          property: "og:title",
          content: props.title,
        }),
        h("meta", {
          key: "og:description",
          property: "og:description",
          content: props.description,
        }),
        h("meta", {
          key: "og:author",
          property: "og:author",
          content: props.author,
        }),
      ],
    }),
    h(BackButton, { href: "/library" }, "Library"),
    h(Container, [
      h(Box, { gap: 32, width: 640 }, [
        h(Box, [
          h(Box, { gap: 8 }, [
            h("h1", props.title),
            h("b.textSecondary", `By ${props.author} | ${props.date}`),
          ]),
          props.living
            ? h(Info, [
                `🌱 This is a `,
                h("b", `living document`),
                `. We're still learning, and may revisit this piece over time. Suggestions for how we can make it better? Please comment below or `,
                h(
                  "a",
                  { href: "mailto:contact@hyperlink.academy" },
                  `send us a note`
                ),
                `.`,
              ])
            : null,
          h(ContentTextStyles, [props.children as React.ReactElement]),
        ]),
        h(
          Box,
          { gap: 32, style: { justifySelf: "center", textAlign: "center" } },
          [
            props.topic
              ? h(
                  "a",
                  { href: props.topic, target: "_blank" },
                  h(Primary, "Discuss this on the forum")
                )
              : null,
            h(Newsletter),
          ]
        ),
      ]),
      !props.toc ? null : h("div", [h(TOCContainer, {}, TOC)]),
    ]),
  ]);
};

function Newsletter() {
  let [email, setEmail] = useState("");
  let [name, _] = useState("Set me in Code");
  let [status, callNewsletterSignup] = useApi<
    NewsletterSignupMsg,
    NewsletterSignupResponse
  >([]);

  let onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    callNewsletterSignup("/api/signup/newsletter", { name, email });
  };

  return h(
    FormBox,
    { onSubmit, gap: 16, style: { maxWidth: 320, textAlign: "center" } },
    [
      h(LabelBox, { gap: 8 }, [
        h("div", [h("h4", "Subscribe to our newsletter for updates")]),
        h(Input, {
          type: "email",
          value: email,
          onChange: (e) => setEmail(e.currentTarget.value),
        }),
      ]),
      h(
        Secondary,
        { type: "submit", status, style: { justifySelf: "center" } },
        "Get Updates"
      ),
    ]
  );
}

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
  padding-left: 32px;
  padding-bottom: 16px;
  border-left: 1px dashed;
  text-align: left;
  justify-items: left;

  ${Tablet} {
    display: none;
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
