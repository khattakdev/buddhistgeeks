import styled from "@emotion/styled";
import h from "react-hyperscript";
import { Fragment, useState, useEffect } from "react";
import { Box } from "./Layout";
import { colors } from "./Tokens";

export const Modal: React.SFC<{
  display: boolean;
  closeText?: string;
  onExit?: Function;
  hideCloseButton?: true;
}> = (props) => {
  let [display, setDisplay] = useState(props.display);
  useEffect(() => setDisplay(props.display), [props]);
  if (!display) return null;
  const onClick = () => {
    setDisplay(false);
    if (props.onExit) props.onExit();
  };
  return h(Fragment, [
    h(ModalBlur, { onClick }),
    h(ModalBox, [
      h(Box, { style: { width: "100%" } }, [
        props.children as React.ReactElement,
        props.hideCloseButton
          ? null
          : h(CloseButton, { onClick }, props.closeText || "close"),
      ]),
    ]),
  ]);
};

const CloseButton = styled("a")`
  font-family: "Roboto Mono", mono;
  font-size: 1rem;
  justify-self: center;
  color: ${colors.textSecondary};
  &:visited {
    color: ${colors.textSecondary};
  }

  &:hover {
    cursor: pointer;
    color: #00008b;
  }
`;

export const ModalBox = styled("div")`
  position: fixed;
  border: 2px solid;
  background-color: ${colors.appBackground};
  max-width: 480px;
  width: 60%;
  padding: 32px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  justify-content: center;
`;

export const ModalBlur = styled("div")`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: white;
  opacity: 0.75;

  @supports (backdrop-filter: blur(2.5px)) {
    backdrop-filter: blur(2.5px);
    background-color: transparent;
    opacity: 1;
  }

  z-index: 9;
`;
