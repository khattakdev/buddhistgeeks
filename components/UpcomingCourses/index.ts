import styled from "@emotion/styled";
import h from "react-hyperscript";
import Course from "./Course";

const courses = [
  {
    title: "Neurodharma",
    image:
      "https://images.pexels.com/photos/7651065/pexels-photo-7651065.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
    cohortNumber: 1,
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled",
    startDate: "June 10, 2021",
    spotsLeft: 9,
  },
  {
    title: "Social Meditation: Basic Facilation",
    image:
      "https://images.pexels.com/photos/2179064/pexels-photo-2179064.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
    cohortNumber: 1,
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled",
    startDate: "July 5, 2021",
    spotsLeft: 5,
  },
  {
    title: "Social Meditation: Basic Facilation",
    image:
      "https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    cohortNumber: 1,
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled",
    startDate: "July 5, 2021",
    spotsLeft: 5,
  },
  {
    title: "Social Meditation: Basic Facilation",
    image:
      "https://images.pexels.com/photos/2365457/pexels-photo-2365457.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
    cohortNumber: 1,
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled",
    startDate: "July 5, 2021",
    spotsLeft: 5,
  },
];

export default function UpcomingCourse() {
  const coursesHTML = courses.map((course) => h(Course, course));
  return h("div", {}, [
    h("h1", {}, "Upcomming Courses"),
    h(CoursesStyle, {}, coursesHTML),
  ]);
}

const CoursesStyle = styled("div")`
  display: flex;
  flex-wrap: wrap;
  width: 125%;
  margin-left: -20px;
`;
