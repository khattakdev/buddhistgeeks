import { Request, APIHandler, ResultType } from "src/apiHelpers";
import airtable from "airtable";

export default APIHandler(submitForm);

export type SubmitFormResponse = ResultType<typeof submitForm>;
export type SubmitFormMsg = {
  base: string;
  data: any;
};
async function submitForm(req: Request) {
  let msg = req.body;

  const base = airtable.base(msg.base);
  await base("Data").create([{ fields: msg.data }]);
  return { status: 200, result: "" };
}
