import h from "react-hyperscript";
import { useRouter } from "next/router";
import { InferGetStaticPropsType } from "next";

import { Error } from "components/Form";
import Loader from "components/Loader";
import { Box } from "components/Layout";

import { useProfileData } from "src/data";
import { colors } from "components/Tokens";
import ErrorPage from "pages/404";
import Text from "components/Text";
import { profileDataQuery } from "pages/api/people/[id]";

type Props = InferGetStaticPropsType<typeof getStaticProps>;

const ProfilePage = (props: Props) =>
  props.notFound ? h(ErrorPage) : h(Profile, props);
export default ProfilePage;

const Profile = (props: Extract<Props, { notFound: false }>) => {
  let router = useRouter();
  let username = router.query.username as string;
  let { data: person } = useProfileData(username, props || undefined);
  if (person === undefined) return h(Loader);
  if (person === false) return h(Error, "No user found :(");

  let link = person.link;
  if (!link?.startsWith("http")) link = "//" + link;

  return h(Box, { gap: 32 }, [
    h(Box, { gap: 8 }, [
      h("h1", [person.display_name || username]),
      h("div", [
        h("b", { style: { color: colors.textSecondary } }, `@${username}`),
        person.pronouns
          ? h("span.textSecondary", ` (${person.pronouns})`)
          : null,
      ]),
      !person.link ? null : h("a", { href: link }, h("b", person.link)),
    ]),
    !person.bio
      ? null
      : h(Box, { width: 640 }, h(Text, { source: person.bio })),
  ]);
};

export const getStaticProps = async (ctx: any) => {
  let username = ctx.params?.username as string;
  let data = await profileDataQuery(username, false);

  if (!data) return { props: { notFound: true } } as const;

  return { props: { notFound: false, ...data }, revalidate: 1 } as const;
};

export const getStaticPaths = async () => {
  return { paths: [], fallback: true };
};
