import styled from "@emotion/styled";
import h from "react-hyperscript";
import Course from "./Course";

const courses = [
  {
    title: "Neurodharma",
    cohortNumber: 1,
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled",
    startDate: "June 10, 2021",
    spotsLeft: 9,
  },
  {
    title: "Social Meditation: Basic Facilation",
    cohortNumber: 1,
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled",
    startDate: "July 5, 2021",
    spotsLeft: 5,
  },
];

export default function UpcomingCourse() {
  return h("div", {}, [
    h("h1", {}, "Upcomming Courses"),
    h(CoursesStyle, {}, [h(Course, courses[0]), h(Course, courses[1])]),
  ]);
}

const CoursesStyle = styled("div")`
  display: flex;
  flex-wrap: wrap;
  width: 125%;
  margin-left: -20px;
`;
