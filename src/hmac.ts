import crypto from "crypto";
export default (input: string) => {
  const hmac = crypto.createHmac("sha256", "");
  hmac.update(input);
  return hmac.digest("hex");
};
