import h from "react-hyperscript";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { getDiscounts, setDiscounts } from "src/clientData";
import { Box } from "components/Layout";
import Link from "next/link";
import Head from "next/head";
import { InferGetServerSidePropsType } from "next";
import { PageLoader } from "components/Loader";
import { getDiscountQuery } from "./api/discounts/[code]";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;
const DiscountPage = (props: Props) => {
  let router = useRouter();
  let fullyRedeemed = !props.discount
    ? false
    : props.discount.max_redeems !== 0 &&
      props.discount.max_redeems <= props.discount.redeems;
  useEffect(() => {
    (async function () {
      if (!props.discount || fullyRedeemed) return;
      let discounts = getDiscounts();
      setDiscounts([
        ...discounts.filter((d) => d.course !== props.discount.course),
        {
          ...props.discount,
          date_added: new Date().toISOString(),
        },
      ]);
      if (props.discount.courses.type === "club") {
        router.push(
          `/courses/${props.discount.courses.slug}/${props.discount.courses.id}/cohorts/${props.discount.courses.course_cohorts[0].id}`
        );
      } else {
        router.push(
          "/courses/[slug]/[id]",
          `/courses/${props.discount.courses.slug}/${props.discount.courses.id}`
        );
      }
    })();
  }, [props.discount]);

  if (!props.discount)
    return h(Box, { style: { textAlign: "center" } }, [
      h("h2", "Sorry "),
      h("p.big", "That discount code is invalid"),
      h(Link, { href: "/" }, h("a", "take me to the homepage")),
    ]);

  return h("div", [
    h(Head, {
      children: [
        h("meta", {
          key: "og:titile",
          property: "og:title",
          content: props.discount.courses.name,
        }),
        h("meta", {
          key: "og:description",
          property: "og:description",
          content: props.discount.courses.description,
        }),
        h("meta", {
          key: "og:image",
          property: "og:image",
          content: props.discount.courses.card_image.split(",")[0],
        }),
        h("meta", {
          key: "twitter:card",
          property: "twitter:card",
          content: "summary",
        }),
      ],
    }),
    fullyRedeemed
      ? h(Box, { style: { textAlign: "center" } }, [
          h("h2", "Sorry"),
          h("p.big", "That discount code has been fully used up"),
          h(Link, { href: "/" }, h("a", "take me to the homepage")),
        ])
      : h(PageLoader),
  ]);
};
export default DiscountPage;

export const getServerSideProps = async (ctx: any) => {
  let code = ctx.query.discount;
  let discount = await getDiscountQuery(code);
  if (!discount || discount.deleted)
    return { props: { discount: undefined } } as const;
  return { props: { discount } } as const;
};
