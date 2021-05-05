import { APIHandler, ResultType, Request } from "../../src/apiHelpers";
import { setTokenHeader } from "../../src/token";
import bcrypt from "bcryptjs";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export type Msg = {
  emailOrUsername: string;
  password: string;
};

export type Result = ResultType<typeof handler>;

const handler = async (req: Request) => {
  let msg = req.body as Partial<Msg>;
  if (!msg.emailOrUsername || !msg.password) {
    return {
      status: 400 as const,
      result: "Invalid request, email or password missing" as const,
    };
  }

  let person = await validateLogin(msg.emailOrUsername, msg.password);
  if (person) {
    let token = {
      username: person.username,
      email: person.email,
      id: person.id,
      display_name: person.display_name,
      bio: person.bio,
      link: person.link,
      admin: person.admins !== null,
    };
    return {
      status: 200 as const,
      headers: setTokenHeader(token),
      result: token,
    };
  } else {
    return {
      status: 401 as const,
      result: "Wrong username or password" as const,
    };
  }
};

export default APIHandler(handler);

async function validateLogin(emailOrUsername: string, password: string) {
  try {
    let person = await prisma.people.findFirst({
      where: {
        OR: [
          { email: { equals: emailOrUsername, mode: "insensitive" } },
          { username: { equals: emailOrUsername, mode: "insensitive" } },
        ],
      },
      include: { admins: true },
    });
    if (!person) return false;
    if (!(await bcrypt.compare(password, person.password_hash))) return false;
    return person;
  } catch (e) {
    console.log(e);
    return false;
  }
}
