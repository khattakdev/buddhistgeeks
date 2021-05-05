import h from "react-hyperscript";
import { Secondary, Primary, LinkButton } from "components/Button";
import { FormBox, LabelBox, Box } from "components/Layout";
import { colors } from "components/Tokens";
import { Cross } from "components/Icons";
import { useState } from "react";
import { Input, Select, Textarea } from "components/Form";
import { useApi } from "src/apiHelpers";
import { CreateEventMsg, CreateEventResponse } from "pages/api/events";
import { Cohort } from "src/data";
import styled from "@emotion/styled";
import { Pill } from "components/Pill";

type Event = {
  name: string;
  start_date: string;
  start_time: string;
  end_time: string;
  location: string;
  description: string;
  everyone: boolean;
  people: string[];
};

export const CreateEvent = (props: {
  cohort: number;
  people: string[];
  mutate: (e: Cohort["cohort_events"][0]) => void;
}) => {
  let [open, setOpen] = useState(false);
  let [event, setEvent] = useState<Event>({
    name: "",
    start_date: "",
    start_time: "",
    end_time: "",
    location: "",
    description: "",
    everyone: false,
    people: [],
  });
  let [status, callCreateEvent] = useApi<CreateEventMsg, CreateEventResponse>(
    [event],
    (e) => {
      if (e.type === "cohort") props.mutate(e.event);
      setEvent({
        everyone: false,
        people: [],
        name: "",
        start_date: "",
        start_time: "",
        end_time: "",
        location: "",
        description: "",
      });
      setOpen(false);
    }
  );

  let onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let d1 = event.start_date.split("-").map((x) => parseInt(x));
    let t1 = event.start_time.split(":").map((x) => parseInt(x));
    let t2 = event.end_time.split(":").map((x) => parseInt(x));
    let start_date = new Date(d1[0], d1[1] - 1, d1[2], t1[0], t1[1]);
    let end_date = new Date(d1[0], d1[1] - 1, d1[2], t2[0], t2[1]);

    callCreateEvent("/api/events", {
      type: "cohort",
      people: event.people,
      cohort: props.cohort,
      name: event.name,
      description: event.description,
      location: event.location,
      start_date: start_date.toISOString(),
      end_date: end_date.toISOString(),
    });
  };
  return h(Box, [
    h(
      Secondary,
      { disabled: open, onClick: () => setOpen(true) },
      "+ Add New Event"
    ),
    !open
      ? null
      : h(FormBox, { onSubmit }, [
          h(EventForm, {
            state: event,
            onChange: setEvent,
            people: props.people,
          }),
          h(Box, { h: true, style: { justifySelf: "right" } }, [
            h(Secondary, { onClick: () => setOpen(!open) }, "Cancel"),
            h(Primary, { type: "submit", status }, "Create Event"),
          ]),
        ]),
  ]);
};

export const EventForm = (props: {
  onChange: (e: Event) => void;
  state: Event;
  people: string[];
}) => {
  let timezone = new Date()
    .toLocaleDateString("en-us", { timeZoneName: "short" })
    .split(", ")[1];
  return h(
    Box,
    {
      width: 640,
      padding: 32,
      gap: 32,
      style: { backgroundColor: colors.grey95 },
    },
    [
      h(LabelBox, { gap: 8 }, [
        h("h4", "Event Name"),
        h(Input, {
          type: "text",
          required: true,
          onChange: (e) =>
            props.onChange({ ...props.state, name: e.currentTarget.value }),
          value: props.state.name,
        }),
      ]),
      h(Box, { h: true, gap: 32, style: { gridAutoColumns: "auto" } }, [
        h(LabelBox, { gap: 8 }, [
          h("h4", "Date"),
          h(Input, {
            type: "date",
            placeholder: "yyyy-mm-dd",
            required: true,
            value: props.state.start_date,
            onChange: (e) =>
              props.onChange({
                ...props.state,
                start_date: e.currentTarget.value,
              }),
          }),
        ]),
        h(LabelBox, { gap: 8 }, [
          h("h4", "Start Time " + `(${timezone})`),
          h(Input, {
            type: "time",
            placeholder: "23:59",
            required: true,
            value: props.state.start_time,
            onChange: (e) =>
              props.onChange({
                ...props.state,
                start_time: e.currentTarget.value,
              }),
          }),
        ]),
        h(LabelBox, { gap: 8 }, [
          h("h4", "End Time " + `(${timezone})`),
          h(Input, {
            type: "time",
            required: true,
            value: props.state.end_time,
            onChange: (e) =>
              props.onChange({
                ...props.state,
                end_time: e.currentTarget.value,
              }),
          }),
        ]),
      ]),
      h(LabelBox, { gap: 8 }, [
        h("div", [
          h("h4", "Location"),
          h(
            "small.textSecondary",
            "A link to where the conversation will happen (like Zoom)"
          ),
        ]),
        h(Input, {
          type: "text",
          required: true,
          value: props.state.location,
          onChange: (e) =>
            props.onChange({ ...props.state, location: e.currentTarget.value }),
        }),
      ]),
      h(LabelBox, { gap: 8 }, [
        h("h4", "Description"),
        h(Textarea, {
          value: props.state.description,
          onChange: (e) =>
            props.onChange({
              ...props.state,
              description: e.currentTarget.value,
            }),
        }),
      ]),
      h(Box, [
        h("h4", "Attendees"),
        h(
          Select,
          {
            onChange: (e) => {
              if (e.currentTarget.value !== "") {
                props.onChange({
                  ...props.state,
                  people: [...props.state.people, e.currentTarget.value],
                });
                e.currentTarget.value = "";
              }
            },
          },
          [
            h(
              "option",
              { value: "" },
              props.state.people.length === 0
                ? "Everyone"
                : "Select another attendee"
            ),
            ...props.people
              .filter((p) => !props.state.people.includes(p))
              .map((p) => h("option", { value: p }, p)),
          ]
        ),
        h(
          AttendeeList,
          props.state.people.map((p) =>
            h(
              "div",
              {
                style: {
                  display: "grid",
                  gridTemplateColumns: "auto min-content",
                  maxWidth: "400px",
                },
              },
              [
                h(AttendeePill, [
                  p,
                  " ",
                  h(
                    LinkButton,
                    {
                      style: { color: colors.textSecondary },
                      onClick: (e) => {
                        e.preventDefault();
                        props.onChange({
                          ...props.state,
                          people: props.state.people.filter(
                            (person) => person !== p
                          ),
                        });
                      },
                    },
                    h(Cross, { width: 10 })
                  ),
                ]),
              ]
            )
          )
        ),
      ]),
    ]
  );
};

let AttendeeList = styled("div")`
  display: flex;
  flex-wrap: wrap;
`;

let AttendeePill = styled(Pill)`
  background-color: ${colors.appBackground};
  margin: 0 8px 8px 0;
`;
