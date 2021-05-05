import h from "react-hyperscript";
import styled from "@emotion/styled";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { InferGetStaticPropsType } from "next";
import Link from "next/link";

import { Box } from "components/Layout";
import { colors } from "components/Tokens";
import { Pill } from "components/Pill";
import { BackButton } from "components/Button";

export type Library = {
  title: string;
  author: string;
  date: string;
  path: string;
  description: string;
  tags: string[];
};

//the Library - Latest layout is defined here

type Props = InferGetStaticPropsType<typeof getStaticProps>;
const Library = (props: Props) => {
  return h(Box, { gap: 64 }, [
    h(Box, { gap: 8 }, [
      h(BackButton, { href: "/library" }, "Collections"),
      h("h1", "Latest Posts"),
    ]),
    ...props.posts
      .sort((a, b) => {
        if (new Date(a.date) < new Date(b.date)) return 1;
        return -1;
      })
      .map((post) => {
        return h(LibraryPost, post);
      }),
  ]);
};

export const getStaticProps = async () => {
  let posts = fs
    .readdirSync("./pages/library")
    .map((file) => {
      if (fs.lstatSync(path.join("./pages/library/", file)).isDirectory())
        return;
      let content = fs.readFileSync("./pages/library/" + file);
      let { data } = matter(content);
      return { ...data, path: "/library/" + file.slice(0, -4) } as Library;
    })
    .filter((x) => x !== undefined);

  return { props: { posts: posts as Library[] } } as const;
};

export default Library;

// This defines the layout for a single library post (tags, title, author, publish date, description)
const LibraryPost = (props: Library) => {
  return h(Box, { gap: 16, style: { maxWidth: 640 } }, [
    h(
      Box,
      { h: true },
      props.tags.map((tag) => h(Tag, { tagType: tag }))
    ),
    h(Box, { gap: 8 }, [
      h(
        Link,
        { href: props.path },
        h(
          "a.notBlue",
          { style: { textDecoration: "none" } },
          h("h2", props.title)
        )
      ),
      h("p.textSecondary", `by ${props.author}  |  ${props.date}`),
    ]),
    h("div", [h("p.big", props.description)]),
  ]);
};

// To add new tag types, add them to this object. Add the tag type and a color the tag should be.
const tagColors: { [key: string]: string | undefined } = {
  announcement: "#cc2288",
  "book-review": "#cc3322",
  "learning-design": "#11aacc",
  "hyperlink-meta": "#1d44d6",
  stargazing: "#6B8648",
};

// This is a function that creates tags with the appropriate tag type and color based on the list above.
const Tag = styled(Pill)<{ tagType: string }>`
  background-color: ${(props) => tagColors[props.tagType] || colors.grey35};
  color: white;
  &::after {
    content: "${(props) => props.tagType}";
  }
`;
