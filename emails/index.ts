import * as postmark from "postmark";
import cohortEnrollmentMetadata from "./templates/cohort-enrollment/meta.json";
import verifiyEmailMetadata from "./templates/welcome/meta.json";
import resetPasswordMetadata from "./templates/password-reset/meta.json";
import inviteToCourseMetadata from "./templates/invite-to-course/meta.json";
import enrollNotificationMetada from "./templates/enroll-notification/meta.json";
import unenrollMetadata from "./templates/cohort-unenroll/meta.json";
import watchingNotificationMetadata from "./templates/watching-notification/meta.json";
import eventRSVPMetadata from "./templates/event-rsvp/meta.json";
import eventRSVPNoAccountMetadata from "./templates/event-rsvp-no-account/meta.json";
import eventUpdateNoAccount from "./templates/event-update-no-account/meta.json";

import { Hash } from "postmark/dist/client/models/client/SupportingTypes";

var client = new postmark.ServerClient(process.env.POSTMARK_TOKEN || "");

export const sendResetPasswordEmail = sendEmail(resetPasswordMetadata);
export const sendVerificationEmail = sendEmail(verifiyEmailMetadata);
export const sendCohortEnrollmentEmail = sendEmail(cohortEnrollmentMetadata);
export const sendEventRSVPEmail = sendEmail(eventRSVPMetadata);
export const sendEventRSVPNoAccountEmail = sendEmail(
  eventRSVPNoAccountMetadata
);
export const sendEventUpdateNoAccountEmail = sendBatchEmail(
  eventUpdateNoAccount
);
export const sendInviteToCourseEmail = sendEmail(inviteToCourseMetadata);
export const sendEnrollNotificationEmaill = sendEmail(enrollNotificationMetada);
export const sendWatchingNotificationEmail = sendBatchEmail(
  watchingNotificationMetadata
);
export const sendUnenrollEmail = sendEmail(unenrollMetadata);

type EmailMetadata = {
  Alias: string;
  TestRenderModel: object;
};
export function sendEmail<T extends EmailMetadata>(meta: T) {
  return async function (
    email: string,
    vars?: T["TestRenderModel"],
    data?: Partial<{
      Metadata?: Hash<string>;
      Attachments: Array<{
        Name: string;
        Content: string;
        ContentType: string;
        ContentID: string | null;
      }>;
    }>
  ) {
    if (process.env.NODE_ENV === "production")
      return client.sendEmailWithTemplate({
        From: "Hyperlink accounts@hyperlink.academy",
        To: email,
        TemplateAlias: meta.Alias,
        TemplateModel: vars,
        ...data,
      });
    console.log(email, vars, data);
  };
}
export function sendBatchEmail<T extends EmailMetadata>(meta: T) {
  return (
    msgs: Array<
      | {
          email: string;
          vars: T["TestRenderModel"];
          data?: Partial<{
            Metadata?: Hash<string>;
            Attachments: Array<{
              Name: string;
              Content: string;
              ContentType: string;
              ContentID: string | null;
            }>;
          }>;
        }
      | undefined
    >
  ) => {
    if (process.env.NODE_ENV === "production")
      return client.sendEmailBatchWithTemplates(
        msgs
          .filter((x) => x !== undefined)
          .map((msg) => {
            return {
              From: "Hyperlink accounts@hyperlink.academy",
              To: msg?.email || "",
              TemplateAlias: meta.Alias,
              TemplateModel: msg?.vars || {},
              MessageStream: "notifications",
              ...msg?.data,
            };
          })
      );
    console.log(msgs);
  };
}
