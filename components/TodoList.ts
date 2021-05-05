import h from "react-hyperscript";
import * as t from "runtypes";
import { useState, useEffect, Fragment } from "react";
import { CheckBox, Input } from "./Form";

let TodoParser = t.Array(t.Boolean);

export function TodoList(props: {
  items: Array<string | React.ReactElement | null>;
  persistKey?: string;
}) {
  let items = props.items.filter((i) => !!i);
  let [checked, setChecked] = useState(new Array(items.length).fill(false));
  useEffect(() => {
    if (!props.persistKey) return;
    let savedValue = localStorage.getItem(props.persistKey);
    try {
      let localData = TodoParser.check(JSON.parse(savedValue || ""));
      setChecked(localData);
    } catch (e) {}
  }, []);
  useEffect(() => {
    if (!props.persistKey) return;
    localStorage.setItem(props.persistKey, JSON.stringify(checked));
  }, [checked]);

  return h(
    Fragment,
    items.map((todo, index) => {
      return h(CheckBox, [
        h(Input, {
          type: "checkbox",
          checked: checked[index],
          onChange: (e) => {
            let newValues = checked.slice(0);
            newValues[index] = e.currentTarget.checked;
            setChecked(newValues);
          },
        }),
        todo,
      ]);
    })
  );
}
