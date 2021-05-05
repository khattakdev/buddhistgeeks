import ICAL from "ical.js";
export const createEventInvite = (props: {
  id: number | string;
  description: string;
  summary: string;
  start_date: string;
  location: string;
  end_date: string;
}) => {
  let calendar = new ICAL.Component(["vcalendar", [], []]);
  calendar.updatePropertyWithValue("version", "2.0");
  calendar.updatePropertyWithValue("prodid", "hyperlink.academy");
  calendar.updatePropertyWithValue("method", "REQUEST");
  calendar.updatePropertyWithValue("name", "Hyperlink Calendar");
  calendar.updatePropertyWithValue("x-wr-calname", "Hyperlink Calendar");

  let vevent = new ICAL.Component("vevent");
  let calEvent = new ICAL.Event(vevent);
  calEvent.uid = "hyperlink-" + props.id;
  calEvent.description = props.description;
  calEvent.summary = props.summary;
  calEvent.location = props.location;
  calEvent.startDate = ICAL.Time.fromJSDate(new Date(props.start_date), true);
  calEvent.endDate = ICAL.Time.fromJSDate(new Date(props.end_date), true);

  calendar.addSubcomponent(vevent);
  return calendar;
};
