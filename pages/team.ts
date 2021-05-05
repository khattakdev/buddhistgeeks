import h from "react-hyperscript";
import styled from "@emotion/styled";
import Link from "next/link";
import Markdown from "react-markdown";

import { Box } from "components/Layout";

//Note to Self : eventually i should add the hyperlink profile link and the twitter profile link and two separate small links under the name.
type TeamProfile = {
  profileImg: string;
  name: string;
  username: string;
  title: string;
  bio: string;
  twitter: string;
  website: string;
};

export const Team = () => {
  return h(Box, { gap: 32 }, [
    h("h1", "The Team"),
    h(TeamLayoutGrid, [
      h(TeamProfile, {
        profileImg: "/img/teamProfiles/Jared.jpg",
        name: "Jared",
        username: "jared",
        title: "Co-Founder",
        bio: `
I've been learning to make technology for learning in one form or another since I graduated high school. That path's taken me through blockchains and peer-to-peer systems, to text-editors and programming languages.

My interests: weird synthesizers, sci-fi and fantasy worlds, free software and information theory.`,
        twitter: "jrdprr",
        website: "https://awarm.space",
      }),

      h(TeamProfile, {
        profileImg: "/img/teamProfiles/celine.jpg",
        name: "Celine",
        title: "Co-Founder",
        username: "celine",
        bio: `
Before Hyperlink I was a Product Designer. In my free time I enjoy making clothes, making pots and dishes, making tables, making paper sculptures, and making other stuff. Despite what this sounds like I also enjoy buying things. 

My interests: havin' a good time over a diet coke and some cake. And of course: lorem ipsum dolor sit amet.`,
        twitter: "cyberspaceline",
        website: "https://celinepark.design",
      }),
      h(TeamProfile, {
        profileImg: "/img/teamProfiles/brendan.jpg",
        name: "Brendan",
        username: "brendan",
        title: "Co-Founder",
        bio: `
I like to make things, in many media: photography to film, hip-hop lyrics to websites. Before Hyperlink, I helped build a learning platform for guitarists. I also run [Antilibraries](https://www.antilibrari.es), a book curation site and bibliophile community.

My interests: indie creator economics, libraries, pedagogy, poetics, translation, deep time, the open web.`,
        twitter: "schlagetown",
        website: "https://www.brendanschlagel.com",
      }),
    ]),
  ]);
};

export default Team;

const ImageContainer = styled("div")`
  height: 240px;
  width: 240px;
  border-radius: 2px;
  overflow: hidden;
`;

const ProfileImg = styled("img")`
  display: block;
  border: none;
  height: 240px;
`;

const TeamLayoutGrid = styled("div")`
  display: grid;
  grid-gap: 64px;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
`;

const TeamProfile = (props: TeamProfile) => {
  return h(Box, { gap: 32 }, [
    h(ImageContainer, [h(ProfileImg, { src: props.profileImg })]),
    h(Box, { gap: 16 }, [
      //name and title
      h(Box, { gap: 4 }, [
        h(
          "h3",
          {},
          h(
            Link,
            { href: "/people/[username]", as: `/people/${props.username}` },
            h("a.notBlue", { style: { textDecoration: "none" } }, props.name)
          )
        ),
        h("strong", props.title),
      ]),

      //bio
      h(Box, { gap: 16 }, h(Markdown, { source: props.bio })),

      //twiiter and website links
      h(Box, { gap: 4 }, [
        h("small", [
          h(
            "a.notBlue",
            { href: `https://twitter.com/${props.twitter}`, target: "_blank" },
            `@${props.twitter}`
          ),
        ]),
        h("small", [
          h(
            "a.notBlue",
            { href: `${props.website}`, target: "_blank" },
            props.website
          ),
        ]),
      ]),
    ]),
  ]);
};
