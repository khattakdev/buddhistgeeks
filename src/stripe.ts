import Stripe from "stripe";
export type StripePaymentMetaData =
  | {
      type: "cohort";
      cohortId: string;
      userId: string;
      discount: string | null;
    }
  | {
      type: "event";
      eventId: string;
      userId: string;
    };

export const stripe = new Stripe(process.env.STRIPE_SECRET || "", {
  apiVersion: "2020-08-27",
});
