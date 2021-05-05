import { ServerResponse, IncomingMessage } from "http";
import cookie from "cookie";

export type Token = {
  email: string;
  id: string;
  username: string;
  display_name?: string | null;
  link?: string | null;
  bio?: string | null;
  admin?: boolean;
};

export function setTokenHeader(token: Token) {
  return {
    "Set-Cookie": cookie.serialize("loginToken", JSON.stringify(token), {
      path: "/",
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
      httpOnly: true,
      sameSite: "lax",
    }),
  };
}

export function getToken(req: IncomingMessage) {
  const cookies = req.headers.cookie;
  if (!cookies) return;

  const { loginToken } = cookie.parse(cookies);
  if (loginToken) return JSON.parse(loginToken) as Token;
  return;
}

export function removeToken(res: ServerResponse) {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("loginToken", "", {
      path: "/",
      expires: new Date(Date.now() - 1000),
      httpOnly: false,
    })
  );
}
