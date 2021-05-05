import h from "react-hyperscript";
import { useState, useEffect } from "react";
import styled from "@emotion/styled";

export default function Loader() {
  let [dots, setDots] = useState(1);
  useEffect(() => {
    let id = setInterval(() => {
      setDots((count) => (count + 1) % 4);
    }, 250);
    return () => {
      clearInterval(id);
    };
  }, []);
  return h("div", ".".repeat(dots) + "\u00a0".repeat(3 - dots));
}

export const PageLoader = () =>
  h(PageLoaderContainer, {}, h(PageLoaderImage, { src: "/img/loading.gif" }));

let PageLoaderImage = styled("img")`
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  width: 100%;
`;

let PageLoaderContainer = styled("div")`
  max-width: 300px;
  margin: auto;
  padding: 32px;
`;
