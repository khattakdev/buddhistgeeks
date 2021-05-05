import h from "react-hyperscript";
import styled from "@emotion/styled";

import { Box, ThreeColumn, FourColumn, Separator } from "../components/Layout";
import { colors, Mobile, Tablet } from "components/Tokens";
import { Primary, Secondary } from "../components/Button";

const CreatorLanding = () => {
  return h(CreatorLandingWrapper, [
    // HEADER / INTRO
    h(SectionContent, [
      h(LandingContainer, [
        h(Box, { gap: 32 }, [
          h(Title, [
            "Create incredible learning experiences with ",
            h("span", { style: { color: "blue" } }, "Hyperlink"),
            ".",
          ]),
          h(Box, { gap: 16 }, [
            h(Tagline, [
              `Hyperlink is for active, transformative learning, with `,
              h("em", `people`),
              ` front and center.`,
            ]),
            h(Tagline, [
              `We give you tools to shape great learning experiences, and do so in a financially sustainable way.`,
            ]),
          ]),
          h(Box, { gap: 16 }, [
            h(
              "a",
              { href: "/forms/propose-course" },
              h(Primary, {}, `Propose a Course`)
            ),
            h(
              "a",
              { href: "/forms/propose-club" },
              h(Secondary, {}, `Propose a Club`)
            ),
          ]),
        ]),
      ]),
    ]),

    // TWO FORMATS
    h(SectionContent, [
      h(Box, { gap: 32, style: { marginTop: "-4rem" } }, [
        h(
          Box,
          {
            gap: 16,
            style: { maxWidth: 720, textAlign: "center", margin: "auto auto" },
          },
          [
            h("h2", "Courses and Clubs."),
            h(
              "p.big",
              `We have two formates for learning. Both are built for serious learning, convening online peer groups to explore niche topics together, led by a facilitator.`
            ),
            h("p.big", [`What kind of learning do you want to build?`]),
          ]
        ),
        h(CourseClubSummary, [
          h(Box, { gap: 16, style: { textAlign: "center" } }, [
            h("img", {
              src: "/img/creatorLanding/courses.png",
              style: { marginLeft: "auto", marginRight: "auto" },
            }),

            h("h3", "Courses"),
            h(Box, { gap: 8 }, [
              h("p", `Driven by a structured curriculum`),
              h("p", `Defined by specific learning outcomes`),
              h("p", `Maintained and improved over time`),
            ]),
            h("a", { href: "#courses" }, h(Secondary, {}, `Learn More`)),
          ]),
          h(Separator),
          h(Box, { gap: 16, style: { textAlign: "center" } }, [
            h("img", {
              src: "/img/creatorLanding/clubs.png",
              style: { marginLeft: "auto", marginRight: "auto" },
            }),

            h("h3", "Clubs"),
            h(Box, { gap: 8 }, [
              h("p", `Driven by a peer group`),
              h("p", `Quicker to try, more room for experiments`),
              h("p", `Looser and more emergent structures`),
            ]),
            h("a", { href: "#clubs" }, h(Secondary, {}, `Learn More`)),
          ]),
        ]),
      ]),
    ]),

    // COURSES
    h(AngledBackground, [
      h(AngledBackgroundContent, [
        h(SectionContent, [
          h(Box, { gap: 64 }, [
            h(Box, [
              h(Box, { gap: 16, style: { maxWidth: 720 } }, [
                h("h2", { id: "courses" }, "Courses"),
                h(
                  "p.big",
                  `Hyperlink Courses aren't limited to a particular subject or structure. We support many kinds of interesting learning experiences, and encourage experimentation. Great courses tend to:`
                ),
              ]),
              h(FourColumn, [
                h(Box, { gap: 8 }, [
                  h("h4", "Nurture a Niche"),
                  h(
                    "p",
                    "Focus on a specific subject; explore it deeply through a striking lens"
                  ),
                ]),
                h(Box, { gap: 8 }, [
                  h("h4", "Reward Repetition"),
                  h(
                    "p",
                    "Align with your practice, help your work grow, improve over time"
                  ),
                ]),
                h(Box, { gap: 8 }, [
                  h("h4", "Propel a Project"),
                  h(
                    "p",
                    "Guide people to actively make or achieve something meaningful"
                  ),
                ]),
                h(Box, { gap: 8 }, [
                  h("h4", "Create Community"),
                  h(
                    "p",
                    "Bring people together, with lasting connection and impact"
                  ),
                ]),
              ]),
            ]),
            h(Box, { gap: 32, style: { maxWidth: 720 } }, [
              h("h3", "Creating a Course"),
              h(CreatingACourseContent, [
                h("img", { src: "/img/creatorLanding/courseStepOne.png" }),
                h(Box, { gap: 8, style: { width: "100%" } }, [
                  h("h4", "Start with an Idea"),
                  h("p", [
                    `Once you have an idea in mind for a course topic, `,
                    h(
                      "a",
                      { href: "/forms/propose-course" },
                      `send us your proposal`
                    ),
                    `.`,
                  ]),
                ]),
              ]),
              h(CreatingACourseContent, [
                h("img", { src: "/img/creatorLanding/courseStepTwo.png" }),
                h(Box, { gap: 8, style: { width: "100%" } }, [
                  h("h4", "Develop a Seedling"),
                  h("p", [
                    "Join us to develop your idea in the ",
                    h(
                      "a",
                      { href: "/courses/the-meta-course/1" },
                      `Meta Course`
                    ),
                    ", where you'll design a curriculum and get early feedback in a community of course creators.",
                  ]),
                ]),
              ]),
              h(CreatingACourseContent, [
                h("img", { src: "/img/creatorLanding/courseStepThree.png" }),
                h(Box, { gap: 8, style: { width: "100%" } }, [
                  h("h4", "Schedule Cohorts"),
                  h(
                    "p",
                    `Run through your curriculum with your first cohort. It won't be perfect but it'll be fun, and next time it'll be even better.`
                  ),
                ]),
              ]),
              h(CreatingACourseContent, [
                h("img", { src: "/img/creatorLanding/courseStepFour.png" }),
                h(Box, { gap: 8, style: { width: "100%" } }, [
                  h("h4", "Publish it on Hyperlink"),
                  h(
                    "p",
                    `Use the Hyperlink course builder to publish your course, complete with curriculum, schedule, templates, and other details.`
                  ),
                ]),
              ]),
              h(CreatingACourseContent, [
                h("img", { src: "/img/creatorLanding/courseStepFive.png" }),
                h(Box, { gap: 8, style: { width: "100%" } }, [
                  h("h4", "Adjust and Improve"),
                  h(
                    "p",
                    `Fine tune your curriculum, run another cohort, learn more, and continue iterating. Wash, rinse, repeat.`
                  ),
                ]),
              ]),
            ]),
          ]),
        ]),
      ]),
    ]),

    // CLUBS
    h(SectionContent, [
      h(Box, { gap: 64 }, [
        h(Box, [
          h(Box, { gap: 16, style: { maxWidth: 720 } }, [
            h("h2", { id: "clubs" }, "Clubs"),
            h(
              "p.big",
              `Hyperlink Clubs are a way to engage in fun, loosely organized learning. They're easier to start, lower time commitment for facilitators, and lower cost for learners. Great clubs tend to:`
            ),
          ]),
          h(ThreeColumn, [
            h(Box, { gap: 8 }, [
              h("h4", "Nurture a Niche"),
              h(
                "p",
                "Focus on a specific subject; explore it deeply through a striking lens"
              ),
            ]),
            h(Box, { gap: 8 }, [
              h("h4", "Explore & Experiment"),
              h("p", "Probe the edges; push the boundaries; try something new"),
            ]),
            h(Box, { gap: 8 }, [
              h("h4", "Participate with Peers"),
              h(
                "p",
                "You facilitate, but everyone co-creates the learning experience together"
              ),
            ]),
          ]),
        ]),
        h(Box, { gap: 32, style: { maxWidth: 720 } }, [
          h("h3", "Creating a Club"),
          h(CreatingACourseContent, [
            h("img", { src: "/img/creatorLanding/clubStepOne.png" }),
            h(Box, { gap: 8, style: { width: "100%" } }, [
              h("h4", "Start with an idea"),
              h("p", [
                `Once you have a club idea in mind, `,
                h(
                  "a",
                  { href: "/forms/propose-club" },
                  `send us your proposal`
                ),
                `. We'll review and get back to you soon.`,
              ]),
            ]),
          ]),
          h(CreatingACourseContent, [
            h("img", { src: "/img/creatorLanding/clubStepTwo.png" }),
            h(Box, { gap: 8, style: { width: "100%" } }, [
              h("h4", "Publish on Hyperlink"),
              h(
                "p",
                `We'll make you a draft club; you'll edit the details and schedule, then publish your club to the site.`
              ),
            ]),
          ]),
          h(CreatingACourseContent, [
            h("img", { src: "/img/creatorLanding/clubStepThree.png" }),
            h(Box, { gap: 8, style: { width: "100%" } }, [
              h("h4", "Run Your Club"),
              h(
                "p",
                `Convene a group of learners and get started exploring together!`
              ),
            ]),
          ]),
          h(CreatingACourseContent, [
            h("img", { src: "/img/creatorLanding/clubStepFour.png" }),
            h(Box, { gap: 8, style: { width: "100%" } }, [
              h("h4", "…And Again?"),
              h(
                "p",
                `You can run your club once, or do it again with a new group, as many times as you like.`
              ),
            ]),
          ]),
        ]),
      ]),
    ]),

    // FEATURES
    h(AngledRightBackground, [
      h(AngledRightBackgroundContent, [
        h(SectionContent, [
          h(Box, { gap: 32 }, [
            h(Box, { gap: 16 }, [h("h2", "Features")]),
            h(FeatureGrid, [
              h(Feature, [
                h("h4", "Simple Course Creation"),
                h(
                  "p.textSecondary",
                  "Draft your curriculum, set a price, add events, build your course structure — we'll help you get everything set up!"
                ),
              ]),
              h(Feature, [
                h("h4", "Registration and Payments"),
                h(
                  "p.textSecondary",
                  "Invite students, collect payments via Stripe, fill your cohorts"
                ),
              ]),
              h(Feature, [
                h("h4", "Schedule Cohorts"),
                h(
                  "p.textSecondary",
                  "Run the course as often as you like, everything set up and ready to go"
                ),
              ]),
              h(Feature, [
                h("h4", "Community and Discussion Space"),
                h(
                  "p.textSecondary",
                  "We set up a forum for your course, with a private space for each cohort"
                ),
              ]),
              h(Feature, [
                h("h4", "Powerful Templates"),
                h(
                  "p.textSecondary",
                  "Configure course templates that will generate structure for each cohort you run"
                ),
              ]),
              h(Feature, [
                h("h4", "Flexible Enrollment"),
                h(
                  "p.textSecondary",
                  "Set participant limits, invite-only courses, create discounts to offer scholarships and more"
                ),
              ]),
              h(Feature, [
                h("h4", "Events and Calendar"),
                h(
                  "p.textSecondary",
                  "Create and view course events; subscribe to a calendar with all your Hyperlink events"
                ),
              ]),
              h(Feature, [
                h("h4", "Hyperlink Community"),
                h(
                  "p.textSecondary",
                  "Meta Course, events, workshops — join a community of like-minded teachers and learners"
                ),
              ]),
              h(Feature, [
                h("h4", "Let's Experiment Together!"),
                h(
                  "p.textSecondary",
                  "We're continually learning; you can impact the shape of this community and what we build"
                ),
              ]),
            ]),
          ]),
        ]),

        // PRICING
        h(SectionContent, [
          h(Box, { gap: 32 }, [
            h(Box, { gap: 16, style: { maxWidth: 720 } }, [
              h("h2", "Pricing"),
              h(
                "p.big",
                "Simple, transparent pricing — no tiers or metering; you get access to all features right from the get go. Here's how it works:"
              ),
              h("ul", [
                h("li", [
                  h(
                    "p.big",
                    "You set the price for your course or club (we're happy to advise)"
                  ),
                ]),
                h("li", [
                  h(
                    "p.big",
                    "Hyperlink takes a 20% platform fee, including payment processing"
                  ),
                ]),
                h("li", [
                  h(
                    "p.big",
                    "You keep 80% of tuition, paid out via Stripe at the end of each cohort"
                  ),
                ]),
              ]),
              h("img", {
                src: "/img/creatorLanding/pricingDiagram.png",
                style: { width: "100%", maxWidth: 640 },
              }),
            ]),
          ]),
        ]),
      ]),
    ]),

    // CTA
    h(SectionContent, [
      h(Box, { gap: 64, style: { textAlign: "center" } }, [
        h(Box, { gap: 16 }, [
          h("h2", "Have an idea?"),
          h("p.big", "Get started by proposing a course or club!"),
          h(ActionItems, [
            h(
              "a",
              { href: "/forms/propose-course" },
              h(Primary, {}, `Propose a Course`)
            ),
            h(
              "a",
              { href: "/forms/propose-club" },
              h(Secondary, {}, `Propose a Club`)
            ),
          ]),
        ]),
        h(Box, { gap: 8 }, [
          h("h3", `Something else in mind? `),
          h("p.big", [
            h(
              "a",
              { href: "mailto:contact@hyperlink.academy" },
              `Send us a note`
            ),
            ` and let us know what you're thinking!`,
          ]),
        ]),
      ]),
    ]),
  ]);
};

export default CreatorLanding;

const CreatorLandingWrapper = styled("div")`
  display: grid;
  grid-auto-rows: auto;
  grid-gap: 128px;

  ${Mobile} {
    grid-gap: 64px;
  }
`;

const AngledBackground = styled("div")`
  background-color: ${colors.accentLightBlue};
  transform: skewY(-11deg);
`;

const AngledBackgroundContent = styled("div")`
  display: grid;
  transform: skewY(11deg);
  margin-top: -3rem;
  margin-bottom: -3rem;
`;

const AngledRightBackground = styled("div")`
  background-color: ${colors.accentLightBlue};
  transform: skewY(8deg);
`;

const AngledRightBackgroundContent = styled("div")`
  display: grid;
  transform: skewY(-8deg);
  margin-top: -4rem;
  margin-bottom: -2rem;
`;

const SectionContent = styled("div")`
  max-width: 1024px;
  margin: auto auto;
  padding: 32px;

  ${Mobile} {
    padding-left: 24px;
    padding-right: 24px;
  }
`;

const LandingContainer = styled("div")`
  /* setting up the background image */
  background-image: url("/img/creatorLanding/cover.png");
  background-repeat: no-repeat;
  background-position: right center;
  background-size: 75%;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  height: 700px;

  ${Tablet} {
    height: auto;
    background-position: right 80px;
  }

  ${Mobile} {
    background-position: center 104px;
    background-size: 280px;
  } ;
`;

/* Text Styling for Landing Content */
const Title = styled("h1")`
  font-family: "Roboto Mono", monospace;
  font-size: 3rem;
  text-decoration: none;
  font-weight: bold;
  z-index: 2;

  ${Tablet} {
    font-size: 2.625rem;
  }
`;

const Tagline = styled("h3")`
  z-index: 2;
  width: 33%;
  font-weight: normal;

  ${Mobile} {
    padding-top: 16px;
    width: 80%;
  }
`;

const CourseClubSummary = styled("div")`
  display: grid;
  grid-template-columns: auto 1px auto;
  grid-gap: 32px;

  ${Mobile} {
    grid-template-columns: auto;
    grid-template-rows: auto 1px auto;
  }
`;

const CreatingACourseContent = styled("div")`
  display: grid;
  grid-auto-flow: row;
  grid-template-columns: 88px auto;
  grid-gap: 16px;
  align-items: center;
  justify-items: center;

  ${Mobile} {
    display: grid;
    grid-auto-flow: column;
    grid-template-rows: auto auto;
    grid-template-columns: auto;
    justify-items: left;
  }
`;
const FeatureGrid = styled("div")`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 32px;

  ${Tablet} {
    grid-template-columns: 1fr 1fr;
  }

  ${Mobile} {
    grid-template-columns: 1fr;
    grid-gap: 16px;
  }
`;

const Feature = styled("div")`
  background-color: white;
  border: solid 1px;
  border-radius: 2px;
  border-color: ${colors.grey80};
  padding: 16px;
`;

const ActionItems = styled("div")`
  display: grid;
  grid-auto-columns: max-content;
  grid-auto-flow: column;
  grid-gap: 16px;
  margin: auto auto;

  ${Mobile} {
    grid-auto-columns: max-content;
    grid-auto-flow: row;
  }
`;
