import h from "react-hyperscript";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import { Box, FormBox, LabelBox } from "components/Layout";
import { Primary } from "components/Button";
import { Error, PasswordInput } from "components/Form";
import { ResetMsg, ResetResult } from "pages/api/user/resetPassword/[action]";
import { useApi } from "src/apiHelpers";

const COPY = {
  header: "Reset Password",
  button: "Reset Password",
  passwordInput: "New Password",
  confirmInput: "Confirm Password",
  error: h(Error, [
    "Looks like that link is expired or invalid, please try to ",
    h(Link, { href: "/login?reset" }, h("a", "reset your password")),
    " again",
  ]),
};

const ResetPassword = () => {
  let [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  let [status, callResetPassword] = useApi<ResetMsg, ResetResult>([formData]);
  let router = useRouter();
  let key = router.query.key as string;

  useEffect(() => {
    if (status === "success") {
      setTimeout(() => {
        router.push("/login");
      }, 3500);
    }
  });

  if (!key || typeof key !== "string") return COPY.error;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await callResetPassword("/api/user/resetPassword/reset", {
      key,
      password: formData.password,
    });
  };

  switch (status) {
    case "normal":
    case "loading":
      return h(FormBox, { onSubmit, width: 400, ma: true }, [
        h("h1", COPY.header),
        h(LabelBox, { gap: 8 }, [
          h("div", [
            h("h4", COPY.passwordInput),
            h("small.textSecondary", "Minimum length 8 characters"),
          ]),
          h(PasswordInput, {
            type: "password",
            minLength: 8,
            value: formData.password,
            onChange: (e) =>
              setFormData({ ...formData, password: e.target.value }),
          }),
        ]),
        h(
          Primary,
          { type: "submit", status, style: { justifySelf: "end" } },
          "Submit"
        ),
      ]);
    case "success":
      return h(Box, [
        h("h1", "Great"),
        h("p", "You can now log in with your new password"),
        h(Link, { href: "/login" }, h("a", h(Primary, "Log In"))),
      ]);
    case "error":
      return COPY.error;
  }
};

export default ResetPassword;
