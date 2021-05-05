import h from "react-hyperscript";
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

  return h(FormBox, { onSubmit, gap: 16, style: { maxWidth: 320 } }, [
    h(LabelBox, { gap: 8 }, [
      h(Box, { gap: 4 }, [
        h("h4", "Drop your email to get updates about new courses and more!"),
        h(
          "small",
          "We'll never spam or share your email. You can unsubscribe at any time."
        ),
      ]),
      h(Input, {
        placeholder: "Your name",
        type: "name",
        value: email,
        onChange: (e) => alert(e.currentTarget.value),
      }),
      h(Input, {
        placeholder: "Your email",
        type: "email",
        value: email,
        onChange: (e) => setEmail(e.currentTarget.value),
      }),
    ]),
    h(Secondary, { type: "submit", status }, "Get Updates"),
  ]);
};

export default NewsLetter;
