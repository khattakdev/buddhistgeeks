import h from "react-hyperscript";
import { Box, Separator } from "components/Layout";
import { useRef } from "react";
import { Input } from "components/Form";
import { Primary } from "components/Button";
import { useUserData, useProfileData } from "src/data";

export default function Calender() {
  let ref = useRef<HTMLInputElement | null>(null);
  let { data: user } = useUserData();
  let { data: profile } = useProfileData(user ? user.username : undefined);

  if (!user || !profile) return null;

  return h(Box, { gap: 32, width: 640, ma: true }, [
    h("h2", "Subscribe to Your Hypercalendar!"),
    h(Box, [
      h(
        "b",
        `Copy this URL to subscribe to all your Hyperlink events in your favorite calendar app.`
      ),
      h(
        "p",
        `❗ We made this calendar just for you, and you only need to add it once! We'll automatically sync events for all your Hyperlink courses, now and in the future.`
      ),
    ]),
    h(Box, { style: { justifyItems: "center" } }, [
      h(Input, {
        ref,
        onFocus: (e) => {
          e.currentTarget.selectionEnd = e.currentTarget.value.length;
        },
        value:
          window.location.origin +
          "/api/user_calendar?id=" +
          profile.calendar_id,
        style: { minWidth: "300px" },
        readOnly: true,
      }),
      h(
        Primary,
        {
          onClick: (e) => {
            e.preventDefault();
            if (!ref.current) return;
            ref.current.select();
            document.execCommand("copy");
            ref.current.selectionEnd = ref.current.selectionStart;
            ref.current.blur();
          },
        },
        "Copy URL"
      ),
    ]),
    h(Separator),
    h(Box, [
      h("h3", "How to Subscribe"),
      h("div", { style: { textAlign: "left" } }, [
        h("h4", "Google Calendar"),
        h("p", [
          h(
            "a",
            {
              href:
                "https://calendar.google.com/calendar/u/0/r/settings/addbyurl",
            },
            "Click here"
          ),
          ` and paste in the above URL.`,
        ]),
      ]),
      h("div", { style: { textAlign: "left" } }, [
        h("h4", "Apple Calendar (Desktop)"),
        h("p", `Hit ‘⌥ + ⌘ + S’ and paste in the above URL.`),
      ]),
      h("div", { style: { textAlign: "left" } }, [
        h("h4", "Outlook.com"),
        h(
          "p",
          `Select "Add Calendar", then "Subscribe from web", paste the above URL and "Import".`
        ),
      ]),
      h("div", { style: { textAlign: "left" } }, [
        h("h4", "Outlook on the web (Microsoft 365)"),
        h(
          "p",
          `Select "Import calendar", then "From web", paste the above URL and "Import".`
        ),
      ]),
      h("div", { style: { textAlign: "left" } }, [
        h("h4", "If you use a different calendar app…"),
        h(
          "p",
          `Look up how it handles calendar subscriptions — there should be a way to subscribe to a calendar from an external URL!`
        ),
      ]),
    ]),
  ]);
}
