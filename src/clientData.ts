import * as t from "runtypes";
import useSWR, { mutate } from "swr";

let discountsParser = t.Array(
  t.Record({
    course: t.Number,
    code: t.String,
    amount: t.Number,
    date_added: t.String,
    type: t.Union(t.Literal("percentage"), t.Literal("absolute")),
  })
);

export function useLocalDiscounts() {
  return useSWR(
    "discounts",
    async () => {
      return getDiscounts();
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
}
export function getDiscounts() {
  try {
    let localData = discountsParser.check(
      JSON.parse(localStorage.getItem("discounts") || "")
    );
    return localData;
  } catch (e) {
    localStorage.setItem("discounts", JSON.stringify([]));
    return [];
  }
}

export function setDiscounts(discounts: t.Static<typeof discountsParser>) {
  localStorage.setItem("discounts", JSON.stringify(discounts));
  mutate("discounts", discounts);
}
