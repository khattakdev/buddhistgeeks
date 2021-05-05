import h from "react-hyperscript";
import Link from "next/link";

import { Box } from "components/Layout";
import { useUserData } from "src/data";
import styled from "@emotion/styled";

export default () => {
  let { data: user } = useUserData();

  return h(
    Box,
    { style: { textAlign: "center", width: "fit-content", margin: "auto" } },
    [
      h("h2", "This page doesn't exist :("),
      h("h3", "It could be bad link, or maybe we're still working on it!"),
      h(
        Link,
        { href: user ? "/dashboard" : "/" },
        h("a", [h("h3", "Go back home!")])
      ),
      h(FourOFourImg, { src: "/img/404.gif" }),
    ]
  );
};

const FourOFourImg = styled("img")`
  max-width: 100%;
  margin: auto auto;
`;
