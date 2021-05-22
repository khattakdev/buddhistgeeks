import styled from "@emotion/styled";

import h from "react-hyperscript";

export default function UpcomingCourse(props: {
  title: string;
  image: string;
  cohortNumber: number;
  description: string;
  startDate: string;
  spotsLeft: number;
}) {
  const { title, image, cohortNumber, description, startDate, spotsLeft } =
    props;
  return h(Course, {}, [
    h(sideImageStyle, {
      src: image,
    }),
    h(contentStyle, {}, [
      h(HeaderStyle, {}, title),
      h(CohortStyle, {}, `Cohort #${cohortNumber}`),
      h(paragraphStyle, {}, description),
      h(startDateStyle, {}, `Starts ${startDate} | `),
      h(spotLeftStyle, {}, `${spotsLeft} spots left!`),
    ]),
  ]);
}

const Course = styled("div")`
  max-width: 48%;
  min-width: 410px;
  min-height: 300px;
  margin: 0 5px;
  margin-top: 10px;
  display: flex;
  border: 2px solid #fcc934;
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

const sideImageStyle = styled("img")`
  width: 30%;
  height: 100%;
`;
// background: url("https://images.pexels.com/photos/7651065/pexels-photo-7651065.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260");
