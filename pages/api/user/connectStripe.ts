import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import { APIHandler, ResultType, Request } from "src/apiHelpers";
import { getToken } from "src/token";

let prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET || "", {
  apiVersion: "2020-08-27",
});

export type GETConnectStripeResult = ResultType<typeof GETConnectStripe>;
async function GETConnectStripe(req: Request) {
  let user = getToken(req);
  let country = req.query.country as string;
  if (!user)
    return { status: 400, result: "ERROR: no user logged in" } as const;
  let user_data = await prisma.people.findUnique({
    where: { id: user.id },
    select: {
      course_maintainers: true,
      stripe_connected_accounts: true,
    },
  });
  if (!user_data)
    return { status: 400, result: "ERROR: no user logged in" } as const;
  if (user_data.course_maintainers.length === 0)
    return { status: 401, result: "ERROR: user is not a maintainer" } as const;

  let id: string;
  if (!user_data.stripe_connected_accounts) {
    let account = await stripe.accounts.create({
      type: "express",
      country,
      capabilities: {
        transfers: {
          requested: true,
        },
      },
      tos_acceptance:
        country === "US"
          ? undefined
          : {
              service_agreement: "recipient",
            },
      metadata: {
        user: user.id,
      },
    });
    await prisma.stripe_connected_accounts.create({
      data: {
        people: { connect: { id: user.id } },
        stripe_account: account.id,
        country,
      },
    });
    id = account.id;
  } else {
    id = user_data.stripe_connected_accounts.stripe_account;
  }

  let link = await stripe.accountLinks.create({
    account: id,
    type: user_data.stripe_connected_accounts?.payouts_enabled
      ? "account_update"
      : "account_onboarding",
    return_url:
      "https://hyperlink.academy/dashboard?tab=Profile#connect-stripe",
    refresh_url:
      "https://hyperlink.academy/dashboard?tab=Profile#connect-stripe",
  });
  console.log(link);
  return { status: 200, result: { url: link.url } } as const;
}

export default APIHandler(GETConnectStripe);
