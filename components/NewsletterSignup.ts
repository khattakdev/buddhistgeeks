import h from "react-hyperscript";
import styled from "@emotion/styled";
import { useState } from "react";
import { useApi } from "../src/apiHelpers";
import {
  NewsletterSignupMsg,
  NewsletterSignupResponse,
} from "../pages/api/signup/[action]";
import { LabelBox, FormBox, Box } from "./Layout";
import { Input } from "./Form";
import { Secondary } from "./Button";

const NewsLetter = () => {
  let [email, setEmail] = useState("");
  let [status, callNewsletterSignup] = useApi<
    NewsletterSignupMsg,
    NewsletterSignupResponse
  >([email]);

  let onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    callNewsletterSignup("/api/signup/newsletter", { email });
  };

  return h(FormBox, { onSubmit, gap: 16, style: { maxWidth: 350 } }, [
    h(LabelBox, { gap: 8 }, [
      h(Box, { gap: 4, style: { width: 370 } }, [
        h("h4", "Drop your email to get updates about new courses and more!"),
        h(
          "small",
          "We'll never spam or share your email. You can unsubscribe at any time."
        ),
      ]),
      h(Input, {
        placeholder: "Your first name",
        type: "name",
        value: email,
        style: { width: 220 },
        onChange: (e) => alert(e.currentTarget.value),
      }),
      h(Input, {
        placeholder: "Your email",
        type: "email",
        value: email,
        style: { width: 220 },
        onChange: (e) => setEmail(e.currentTarget.value),
      }),
    ]),
    h(
      Secondary,
      {
        type: "submit",
        status,
        style: { border: "2px solid #4b93cf", color: "#4b93cf" },
      },
      "Get Updates"
    ),
  ]);
};

export default NewsLetter;
