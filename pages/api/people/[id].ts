import { APIHandler, Request, ResultType } from "../../../src/apiHelpers";
import { setTokenHeader, getToken } from "../../../src/token";
import { syncSSO } from "../../../src/discourse";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export type UpdatePersonMsg = {
  profile?: {
    pronouns?: string;
    display_name?: string;
    link?: string;
    bio?: string;
  };
  password?: {
    new: string;
    old: string;
  };
};

export type UpdatePersonResult = ResultType<typeof updatePerson>;
export type ProfileResult = ResultType<typeof getProfileData>;

export default APIHandler({ POST: updatePerson, GET: getProfileData });

async function updatePerson(req: Request) {
  let body = req.body as Partial<UpdatePersonMsg>;
  let user = getToken(req);
  if (!user) {
    return {
      status: 400 as const,
      result: "Error: No user signed in" as const,
    };
  }

  let setHeaders;
  if (body.password) {
    if (await validateLogin(user.email, body.password.old)) {
      await updatePassword(user.email, body.password.new);
    } else {
      return {
        status: 401 as const,
        result: "Error: Incorrect password" as const,
      };
    }
  }

  if (body.profile) {
    let newData = await prisma.people.update({
      where: { id: user.id },
      data: {
        display_name: body.profile.display_name,
        link: body.profile.link,
        bio: body.profile.bio,
        pronouns: body.profile.pronouns,
      },
    });
    setHeaders = setTokenHeader({
      ...user,
      display_name: newData.display_name,
      link: newData.link,
      bio: newData.bio,
    });
    await syncSSO({
      external_id: user.id,
      email: user.email,
      username: user.username,
      name:
        newData.display_name +
          (newData.pronouns ? `(${newData.pronouns})` : "") || "",
      bio: newData.bio || "",
      website: newData.link || "",
    });
  }

  return {
    status: 200,
    result: "",
    headers: setHeaders,
  } as const;
}

async function validateLogin(
  email: string,
  password: string
): Promise<boolean> {
  try {
    let person = await prisma.people.findUnique({ where: { email } });
    if (!person) return false;
    return await bcrypt.compare(password, person.password_hash);
  } catch (e) {
    return false;
  }
}

async function updatePassword(email: string, newPassword: string) {
  let password_hash = await bcrypt.hash(newPassword, await bcrypt.genSalt());
  await prisma.people.update({ where: { email }, data: { password_hash } });
}
let prisma = new PrismaClient();

export const profileDataQuery = (username: string, loggedIn: boolean) => {
  return prisma.people.findUnique({
    where: { username: username },
    select: {
      stripe_connected_accounts: loggedIn,
      calendar_id: loggedIn,
      pronouns: true,
      display_name: true,
      bio: true,
      link: true,
    },
  });
};

async function getProfileData(req: Request) {
  let username = req.query.id as string;
  let user = getToken(req);
  if (!username)
    return { status: 400, result: "ERROR: no user id provided" } as const;
  let data = await profileDataQuery(username, user?.username === username);
  if (!data)
    return {
      status: 404,
      result: `Error: no user with id ${username} found`,
    } as const;
  return { status: 200, result: data } as const;
}
