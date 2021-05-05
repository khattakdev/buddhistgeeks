import h from "react-hyperscript";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import { Box, LabelBox, FormBox } from "components/Layout";
import { Input, Error, Info, CheckBox, PasswordInput } from "components/Form";
import { Primary } from "components/Button";
import { AccentImg, HalfLoopImg } from "components/Images";
import { useUserData } from "src/data";
import { callApi, useApi } from "src/apiHelpers";
import { useDebouncedEffect } from "src/hooks";
import {
  VerifyEmailMsg,
  SignupMsg,
  VerifyEmailResponse,
  SignupResponse,
} from "pages/api/signup/[action]";
import { CheckUsernameResult } from "pages/api/get/[...item]";
import styled from "@emotion/styled";
import { usernameValidate } from "src/utils";

const COPY = {
  submitButton: "Create your account",
  headerDescription:
    "We're hyped for you to join the Hyperlink community! Let's learn together.",
};

const Signup = () => {
  let [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    newsletter: false,
  });

  let [status, callSignupRequest] = useApi<SignupMsg, SignupResponse>(
    [formData],
    () => router.push("/signup?verifyEmail")
  );
  let [usernameValid, setUsernameValid] = useState<null | boolean>(null);
  let { data: user } = useUserData();
  let router = useRouter();

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user]);
  useDebouncedEffect(
    async () => {
      if (!formData.username) return setUsernameValid(null);
      if (!usernameValidate(formData.username)) return setUsernameValid(null);
      let res = await callApi<null, CheckUsernameResult>(
        "/api/get/username/" + formData.username
      );
      if (res.status === 404) setUsernameValid(true);
      else setUsernameValid(false);
    },
    500,
    [formData.username]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await callSignupRequest("/api/signup/request", formData);
  };

  if (router.query.verifyEmail !== undefined) {
    return h(VerifyEmail, { email: formData.email, resendEmail: onSubmit });
  }

  return h(FormBox, { onSubmit, width: 400, ma: true, gap: 32 }, [
    h(Box, { gap: 8 }, [
      h(SignUpHeader, [
        h("h1", "Sign Up"),
        h(HalfLoopImg, {
          src1: "/img/sailboat-1.gif",
          src2: "/img/sailboat-2.gif",
          alt: "an animated gif of a sailboat, boatin'",
          startLoop: 333,
        }),
      ]),
      h("p.big", COPY.headerDescription),
      h("p.textSecondary", [
        "Or ",
        h(Link, { href: "/login" }, h("a", "log in")),
        " with an existing account.",
      ]),
    ]),
    status === "error"
      ? h(
          Error,
          {},
          h("div", [
            "A user already exists with that email. Try ",
            h(Link, { href: "/login" }, h("a", "logging in")),
            ".",
          ])
        )
      : null,
    h(LabelBox, { gap: 8 }, [
      h("div", [
        h("h4", "Username"),
        h(
          "small.textSecondary",
          "Pick a unique username between 3-15 characters."
        ),
      ]),
      h(Input, {
        type: "text",
        name: "username",
        required: true,
        minLength: 3,
        maxLength: 15,
        value: formData.username,
        onChange: (e) => {
          setFormData({ ...formData, username: e.currentTarget.value });
          if (!usernameValidate(e.currentTarget.value || "")) {
            e.currentTarget.setCustomValidity(
              "Your username must contain only letters, numbers, underscores, periods or dashes"
            );
          } else {
            e.currentTarget.setCustomValidity("");
          }
        },
      }),
      formData.username.length < 3
        ? null
        : !usernameValidate(formData.username)
        ? h(
            "span.accentRed",
            "Your username must contain only letters, numbers, underscores, periods or dashes"
          )
        : usernameValid === null
        ? ""
        : usernameValid
        ? h("span.accentSuccess", "Great! This username is available.")
        : h("span.accentRed", "Sorry, that username is taken."),
    ]),
    h(LabelBox, { gap: 8 }, [
      h("div", [
        h("h4", "Your Email"),
        h("small.textSecondary", "You'll have to verify this in a moment."),
      ]),
      h(Input, {
        type: "email",
        name: "email",
        required: true,
        value: formData.email,
        onChange: (e) =>
          setFormData({ ...formData, email: e.currentTarget.value }),
      }),
    ]),
    h(LabelBox, { gap: 8 }, [
      h("div", [
        h("h4", "Password"),
        h("small.textSecondary", "Minimum length 8 characters"),
      ]),
      h(PasswordInput, {
        name: "new-password",
        required: true,
        minLength: 8,
        value: formData.password,
        onChange: (e) =>
          setFormData({ ...formData, password: e.currentTarget.value }),
      }),
    ]),
    h(LabelBox, { gap: 8 }, [
      h("div", [
        h("h4", "Get email updates?"),
        h(
          "small.textSecondary",
          "We send out occasional updates on new courses and features. We'll never spam or share your email."
        ),
      ]),
      h(CheckBox, [
        h(Input, {
          type: "checkbox",
          name: "newsletter",
          checked: formData.newsletter,
          onChange: (e) => {
            setFormData({ ...formData, newsletter: e.currentTarget.checked });
          },
        }),
        "Sure! Gimme the updates.",
      ]),
    ]),
    h(
      Primary,
      { status, style: { justifySelf: "end" }, type: "submit" },
      COPY.submitButton
    ),
  ]);
};

const VerifyEmail = (props: { email?: string; resendEmail: any }) => {
  let router = useRouter();
  let [key, setKey] = useState("");
  let [status, callSignupVerify] = useApi<VerifyEmailMsg, VerifyEmailResponse>(
    [key],
    () => {
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    }
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await callSignupVerify("/api/signup/verify", { key });
  };

  useEffect(() => {
    if (
      router.query.verifyEmail &&
      typeof router.query.verifyEmail === "string"
    ) {
      callSignupVerify("/api/signup/verify", { key: router.query.verifyEmail });
    }
  }, []);

  if (router.query.verifyEmail && status === null) return null;

  if (status === "success")
    return h(Box, { width: 400, ma: true, gap: 16 }, [
      h("h1", "All Done!"),
      h(
        "p.big",
        "Click the button below if you're not redirected in a couple seconds"
      ),
      h(
        Link,
        { href: "/dashboard" },
        h("a", {}, h(Primary, "Back to Hyperlink"))
      ),
    ]);

  return h(FormBox, { onSubmit, width: 400, ma: true, gap: 32 }, [
    h(AccentImg, {
      src: "/img/plane.gif",
      alt: "an animated gif of a paper airplane taking off",
    }),
    h("h1", "Verify your email"),
    props.email
      ? h(Box, { gap: 8 }, [
          `Sweet! We sent an email with a verification code to`,
          h(Info, {}, h("b", props.email)),
        ])
      : null,
    h(Box, { gap: 8 }, [
      h("h4", `Copy the code there and submit it here:`),
      h(Input, {
        spellCheck: false,
        type: "text",
        value: key,
        onChange: (e) => setKey(e.currentTarget.value.trim()),
      }),
    ]),
    status === "error"
      ? h(Error, {}, [
          "Your email link is invalid or out of date, please try ",
          h(Link, { href: "/signup" }, h("a", "signing up again")),
          ".",
        ])
      : null,
    h(
      Primary,
      { type: "submit", status, style: { justifySelf: "right" } },
      "Confirm your email"
    ),
  ]);
};

export const SignUpHeader = styled("div")`
  display: grid;
  grid-gap: 16px;
  grid-template-columns: auto min-content;
  align-items: end;
`;

export default Signup;
