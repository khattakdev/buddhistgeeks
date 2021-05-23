import h from "react-hyperscript";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import { Box, LabelBox, FormBox } from "components/Layout";
import { Input, Error, Info } from "components/Form";
import { Primary } from "components/Button";
import { AccentImg } from "components/Images";
import { useApi } from "src/apiHelpers";
import { Result, Msg } from "pages/api/login";
import {
  RequestMsg,
  RequestResult,
} from "pages/api/user/resetPassword/[action]";
import { useUserData } from "src/data";
import styled from "@emotion/styled";

const COPY = {
  emailOrUsernameInput: "Email or Username",
  passwordInput: "Password",
  resetPassword: "Reset password",
  loginHeader: "Log In",
  wrongLogin: h("div", [
    "The email/username and password don't match",
    h("br"),
    "If you want, you can ",
    h(Link, { href: "/login?reset" }, h("a", "reset your password here")),
    ".",
  ]),
  loginButton: "Log In",
};

const Login = () => {
  let router = useRouter();
  let [formData, setFormData] = useState({ emailOrUsername: "", password: "" });
  let redirect = router.query.redirect as string | null;
  let { reset } = router.query;
  let { data, mutate } = useUserData();
  let [status, callLogin] = useApi<Msg, Result>([formData], async (result) => {
    if (redirect) {
      if (
        redirect[0] !== "/" ||
        redirect.startsWith("/sso") ||
        redirect.startsWith("/api")
      ) {
        return window.location.assign(redirect);
      }
      await mutate(result);
      await router.push(redirect as string);
    } else await router.push("/dashboard");
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    callLogin("/api/login", formData);
  };

  useEffect(() => {
    if (data) router.push((redirect as string) || "/dashboard");
  }, [data]);
  if (typeof reset !== "undefined") return h(ResetPassword);

  return h(FormBox, { onSubmit, width: 400, ma: true, gap: 32 }, [
    h(Box, [
      h(LoginHeader, [h("h1", COPY.loginHeader)]),
      h("p.textSecondary", [
        "Or ",
        h(Link, { href: "/signup" }, h("a", "sign up")),
        " for a new account",
      ]),
    ]),

    status === "error" ? h(Error, {}, COPY.wrongLogin) : null,

    h(LabelBox, { gap: 8 }, [
      h("h4", COPY.emailOrUsernameInput),
      h(Input, {
        type: "text",
        value: formData.emailOrUsername,
        required: true,
        onChange: (e) =>
          setFormData({ ...formData, emailOrUsername: e.currentTarget.value }),
      }),
    ]),

    h(LabelBox, { gap: 8 }, [
      h("h4", COPY.passwordInput),
      h(Input, {
        type: "password",
        value: formData.password,
        required: true,
        onChange: (e) =>
          setFormData({ ...formData, password: e.currentTarget.value }),
      }),
      h(
        Link,
        { href: "/login?reset" },
        h("a", { style: { justifySelf: "right" } }, COPY.resetPassword)
      ),
    ]),
    h(
      Primary,
      { type: "submit", status, style: { justifySelf: "right" } },
      COPY.loginButton
    ),
  ]);
};

const RESETCOPY = {
  header: "Reset Password",
  emailInput: "Your account email",
  button: "Reset Password",
  successHeader: "Check your Email",
};

const ResetPassword = () => {
  let [email, setEmail] = useState("");
  let [status, callResetPassword, setStatus] = useApi<
    RequestMsg,
    RequestResult
  >([email]);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await callResetPassword("/api/user/resetPassword/request", { email });
  };

  switch (status) {
    case "normal":
    case "loading":
      return h(FormBox, { onSubmit, width: 400, ma: true }, [
        h("h1", RESETCOPY.header),
        h(LabelBox, { gap: 16 }, [
          h("h4", RESETCOPY.emailInput),
          h(Input, {
            type: "email",
            required: true,
            value: email,
            onChange: (e) => setEmail(e.currentTarget.value),
          }),
        ]),
        h(
          "div",
          { style: { display: "grid", justifyItems: "end", gridGap: "8px" } },
          [h(Primary, { type: "submit", status }, RESETCOPY.button)]
        ),
      ]);
    case "success":
      return h(Box, { gap: 16, width: 400, ma: true }, [
        h(AccentImg, {
          src: "/img/plane.gif",
          alt: "an animated gif of a paper airplane taking off",
        }),
        h("h1", RESETCOPY.successHeader),
        "We sent an email with a password reset link to",
        h(Info, email),
        "It expires in 30 minutes.",
        h("br"),
        h(
          Primary,
          {
            style: { width: "100%" },
            onClick: () => setStatus("normal"),
          },
          "Send another link"
        ),
      ]);
    case "error":
      return h(Box, { width: 400, ma: true }, [
        h(Error, "something went wrong, please refresh and try again"),
      ]);
  }
};
export const LoginHeader = styled("div")`
  display: grid;
  grid-gap: 16px;
  grid-template-columns: auto min-content;
  align-items: end;
`;
export default Login;
