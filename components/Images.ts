import styled from "@emotion/styled";
import { useState, useEffect, useRef } from "react";
import h from "react-hyperscript";

export let TitleImg = styled("img")<{ height?: number; width: number }>`
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  display: block;
  border: 2px solid;
  height: ${(props) => (props.height ? props.height + "px" : "auto")};
  width: ${(props) => props.width}px;
`;

export let AccentImg = styled("img")<{ height?: number; width?: number }>`
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
  display: block;
  border: none;
  height: ${(props) => (props.height ? props.height + "px" : "100px")};
  width: ${(props) => (props.width ? props.width + "px" : "100px")};
`;

export function HalfLoopImg(props: {
  src1: string;
  src2: string;
  alt: string;
  startLoop: number;
}) {
  let [looping, setLooping] = useState(false);
  let imageRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (imageRef.current?.complete && !looping) {
      setTimeout(() => setLooping(true), props.startLoop);
    }
  }, []);

  if (!looping) {
    return h(AccentImg, {
      ref: imageRef,
      onLoad: () => {
        setTimeout(() => setLooping(true), props.startLoop);
      },
      src: props.src1,
      alt: props.alt,
    });
  }
  return h(AccentImg, { src: props.src2, alt: props.alt });
}
