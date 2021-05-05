import { APIHandler, ResultType, Request } from "../../src/apiHelpers";
import { createPost } from "../../src/discourse";
export type FeedbackResult = ResultType<typeof handler>;
export type FeedbackMsg = {
  feedback: string;
  email?: string;
  page: string;
  username?: string;
};

export default APIHandler(handler);

async function handler(req: Request) {
  let msg = req.body as Partial<FeedbackMsg>;
  await createPost({
    topic_id: 231,
    raw: `
${msg.username ? "username: @" + msg.username : ""}
${msg.email ? "email: " + msg.email : ""}
page: ${req.headers.referer}

${msg.feedback}
`,
  });
  return { status: 200, result: "" } as const;
}
