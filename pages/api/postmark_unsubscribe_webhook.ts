import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

let prisma = new PrismaClient();

let username = process.env.POSTMARK_WEBHOOK_USERNAME;
let password = process.env.POSTMARK_WEBHOOK_PASSWORD;

if (!password || !username) throw new Error("no username or password in env ");

export default async (req: NextApiRequest, res: NextApiResponse) => {
  let BasicAuth = req.headers.authorization;
  if (!BasicAuth || !BasicAuth.startsWith("Basic ")) {
    console.log("no basic auth header");
    return res.status(400).end();
  }
  if (!password || !username) return res.status(500).end();

  let authorization = Buffer.from(BasicAuth.substring(6), "base64")
    .toString("utf-8")
    .split(":");
  if (
    authorization[0] !== username ||
    !(await bcrypt.compare(authorization[1], password))
  ) {
    console.log("username password verification failed");
    return res.status(400).end();
  }

  let data = req.body;
  if (data.metadata.type !== "course-watching-notification")
    return res.status(200).end();
  let course = parseInt(data.Metadata.course);
  console.log(req.body);
  await prisma.watching_courses.delete({
    where: {
      email_course: {
        email: data.Recipient,
        course,
      },
    },
  });
  return res.status(200).end();
};
