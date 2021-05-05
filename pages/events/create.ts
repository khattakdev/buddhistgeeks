import h from "react-hyperscript";
import { useRouter } from "next/router";
import { useState } from "react";

import { Input } from "components/Form";
import { Primary } from "components/Button";
import { LabelBox, FormBox, Box, Separator } from "components/Layout";

import { useApi } from "src/apiHelpers";
import { useUserData } from "src/data";
import { CreateEventMsg, CreateEventResponse } from "pages/api/events";
import { dateFromDateAndTimeInputs, formHelper } from "src/utils";
import EditorWithPreview from "components/EditorWithPreview";

type EventInput = {
  name: string;
  cost: number;
  max_attendees: number;
  description: string;
  start_date: string;
  start_time: string;
  end_time: string;
  location: string;
};

const CreateEvent = () => {
  let { data: user } = useUserData();
  let router = useRouter();
  let [formData, setFormData] = useState({
    name: "",
    cost: 0,
    max_attendees: 0,
    description: "",
    start_date: "",
    start_time: "",
    end_time: "",
    location: "",
  });
  let [status, callCreateEvent] = useApi<CreateEventMsg, CreateEventResponse>(
    []
  );

  if (user === false) router.push("/");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let start_date = dateFromDateAndTimeInputs(
      formData.start_date,
      formData.start_time
    ).toISOString();
    let end_date = dateFromDateAndTimeInputs(
      formData.start_date,
      formData.end_time
    ).toISOString();

    let result = await callCreateEvent("/api/events", {
      ...formData,
      type: "standalone",
      start_date,
      end_date,
    });
    if (result.status === 200)
      router.push("/events/" + result.result.event.events.id);
  };

  return h(FormBox, { onSubmit }, [
    h("h1", "Create a New Event"),
    h(EventForm, { onChange: setFormData, state: formData }),
    h(Primary, { status, type: "submit" }, "Submit"),
  ]);
};

export const EventForm = (props: {
  onChange: (e: EventInput) => void;
  state: EventInput;
}) => {
  let f = formHelper(props.state, props.onChange);
  let timezone = new Date()
    .toLocaleDateString("en-us", { timeZoneName: "short" })
    .split(", ")[1];
  return h(Box, [
    h(LabelBox, { gap: 8, width: 400 }, [
      h("h4", "Event Name"),
      h(Input, { ...f.name }),
    ]),
    h(LabelBox, { gap: 8 }, [
      h("h4", "Description"),
      h(EditorWithPreview, { height: 400, ...f.description }),
    ]),
    h(Separator),
    h(
      Box,
      { h: true, gap: 32, width: 640, style: { gridAutoColumns: "auto" } },
      [
        h(LabelBox, { gap: 8 }, [
          h("h4", "Date"),
          h(Input, {
            type: "date",
            required: true,
            ...f.start_date,
          }),
        ]),
        h(LabelBox, { gap: 8 }, [
          h("h4", "Start Time " + `(${timezone})`),
          h(Input, {
            type: "time",
            required: true,
            ...f.start_time,
          }),
        ]),
        h(LabelBox, { gap: 8 }, [
          h("h4", "End Time " + `(${timezone})`),
          h(Input, {
            type: "time",
            required: true,
            ...f.end_time,
          }),
        ]),
      ]
    ),
    h(LabelBox, { gap: 8, width: 400 }, [
      h("div", [
        h("h4", "Location"),
        h("small.textSecondary", "Like a Zoom, Jitsi, or Google Meet link"),
      ]),
      h(Input, { ...f.location, required: true }),
    ]),
    h(LabelBox, { gap: 8, width: 400 }, [
      h("div", [
        h("h4", "Max participants"),
        h("small.textSecondary", "Set to 0 for no limit"),
      ]),
      h(Input, { type: "number", min: 0, ...f.max_attendees }),
    ]),
    h(LabelBox, { gap: 8, width: 400 }, [
      h("h4", "Cost"),
      h(Input, { type: "number", min: 0, ...f.cost }),
    ]),
  ]);
};

export default CreateEvent;
