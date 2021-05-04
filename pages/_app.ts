import h from "react-hyperscript";
import Head from "next/head";
import Layout from "../components/Layout";
import * as Sentry from "@sentry/node";
import { Fragment } from "react";

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    enabled: process.env.NODE_ENV === "production",
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  });
}

type Props = {
  Component: any;
  pageProps: any;
};

const App = ({ Component, pageProps }: Props) => {
  return h(Fragment, [
    h(Head as React.FunctionComponent, [
      h("title", "buddhistgeeks.training"),
      h("meta", {
        property: "og:title",
        content: "buddhistgeeks.training",
        key: "og:title",
      }),
      h("meta", {
        property: "og:description",
        content:
          "a course platform and online school built for seriously effective learning",
        key: "og:description",
      }),
      h("meta", {
        property: "og:image",
        content: "http://localhost:3000/img/social-logo.png", // This is temporary
        key: "og:image",
      }),
    ]),
    h(Layout, {}, [h(Component, { ...pageProps })]),
  ]);
};

export default App;
