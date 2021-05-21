import styled from "@emotion/styled";
import h from "react-hyperscript";
import Course from "./Course";

export default function UpcomingCourse() {
  return h("div", {}, [
    h("h1", {}, "Upcomming Courses"),
    h(CoursesStyle, {}, [h(Course), h(Course)]),
  ]);
}

const CoursesStyle = styled("div")`
  display: flex;
  flex-wrap: wrap;
`;
