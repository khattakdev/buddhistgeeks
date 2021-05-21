import styled from "@emotion/styled";

import h from "react-hyperscript";

export default function UpcomingCourse() {
  return h(Course, {}, [
    h(sideImageStyle, {}),
    h(contentStyle, {}, [
      h(HeaderStyle, {}, "Neurodharma"),
      h(CohortStyle, {}, "Cohort #1"),
      h(
        paragraphStyle,
        {},
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centurie"
      ),
      h(startDateStyle, {}, "Starts June 10, 2021 | "),
      h(spotLeftStyle, {}, "9 spots left!"),
    ]),
  ]);
}

const Course = styled("div")`
  max-width: 510px;
  min-width: 410px;
  min-height: 300px;
  margin: 0 5px;
  margin-top: 10px;
  display: flex;
  border: 2px solid #fcc934;
  background
`;

const HeaderStyle = styled("h2")`
  color: #4b93cf;
  margin-bottom: 10px;
`;

const contentStyle = styled("div")`
  padding: 5px;
  padding-left: 15px;
`;

const CohortStyle = styled("h5")`
  font-weight: bold;
  font-size: 15px;

  color: #636466;
`;

const paragraphStyle = styled("p")`
  color: #6e6e6e;
  margin: 20px 0px;
`;

const startDateStyle = styled("h6")`
  display: inline;
  font-weight: bold;
  font-size: 15px;
`;

const spotLeftStyle = styled("span")`
  color: #99d43c;
  font-weight: bold;
`;

const sideImageStyle = styled("div")`
  background: url("https://images.pexels.com/photos/7651065/pexels-photo-7651065.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260");
  width: 180%;
  height: 100%;
`;
