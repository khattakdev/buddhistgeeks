/// <reference types="next" />
/// <reference types="next/types/global" />

declare module "*.mdx" {
  let MDXComponent: (props: any) => JSX.Element;
  export default MDXComponent;
}

declare module "*.txt" {
  export default string;
}

declare module "ical.js" {
  class Component {
    constructor(x: ComponentName | JCAL, parent?: Component);
    addPropertyWithValue(
      name: string,
      value: string | number | object
    ): Property;
    updatePropertyWithValue(
      name: string,
      value: string | number | object
    ): Property;
    addSubcomponent(c: Component);
    toString(): string;
  }
  class Property {}
  class Event {
    constructor(component?: Component);
    organizer: string;
    summary: string;
    description: string;
    uid: string;
    startDate: Time;
    endDate: Time;
    location: string;
  }
  class Time {
    static now(): Time;
    static fromJSDate(d: Date, useUTC?: boolean): Time;
  }
  class Duration {
    constructor(
      data: Partial<{
        weeks: number;
        months: number;
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
      }>
    );
  }
}

declare module "remark-emoji" {
  any;
}
