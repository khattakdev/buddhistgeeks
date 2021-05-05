import h from "react-hyperscript";
import styled from "@emotion/styled";
import { Tablet, Mobile, colors } from "./Tokens";

export const TwoColumnBanner: React.SFC<{ red?: boolean }> = (props) => {
  return h(Banner, props, [
    h(
      "div",
      {
        style: {
          maxWidth: 960,
          padding: 32,
          marginLeft: "auto",
          marginRight: "auto",
          marginTop: "auto",
          marginBottom: 32,
        },
      },
      h(BannerInner, [props.children as React.ReactElement])
    ),
  ]);
};

const BannerInner = styled("div")`
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-gap: 64px;
  ${Tablet} {
    grid-template-columns: auto;
    grid-template-rows: auto;
  }
`;

const Banner = styled("div")<{ red?: boolean }>`
  z-index: 8;
  background-color: ${(props) =>
    props.red ? colors.backgroundRed : colors.grey95};
  position: relative;
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;

  margin-bottom: 16px;
  margin-top: -48px;
  ${Mobile} {
    margin-top: 0px;
  }
`;
