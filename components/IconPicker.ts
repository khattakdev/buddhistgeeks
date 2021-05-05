import styled from "@emotion/styled";
import h from "react-hyperscript";
import { Box } from "./Layout";
import { LinkButton } from "./Button";

const Icons = [
  "https://hyperlink-data.nyc3.cdn.digitaloceanspaces.com/icons/EmojiSet/Lightbulb.png",
  "https://hyperlink-data.nyc3.cdn.digitaloceanspaces.com/icons/EmojiSet/Sparkle.png",
  "https://hyperlink-data.nyc3.cdn.digitaloceanspaces.com/icons/EmojiSet/Picture.png",
  "https://hyperlink-data.nyc3.cdn.digitaloceanspaces.com/icons/EmojiSet/Video.png",
  "https://hyperlink-data.nyc3.cdn.digitaloceanspaces.com/icons/EmojiSet/MusicNote.png",
  "https://hyperlink-data.nyc3.cdn.digitaloceanspaces.com/icons/EmojiSet/Potion.png",
  "https://hyperlink-data.nyc3.cdn.digitaloceanspaces.com/icons/EmojiSet/Plant.png",
  "https://hyperlink-data.nyc3.cdn.digitaloceanspaces.com/icons/EmojiSet/Puzzle.png",
  "https://hyperlink-data.nyc3.cdn.digitaloceanspaces.com/icons/EmojiSet/Chart.png",
  "https://hyperlink-data.nyc3.cdn.digitaloceanspaces.com/icons/EmojiSet/MoneyBag.png",
  "https://hyperlink-data.nyc3.cdn.digitaloceanspaces.com/icons/EmojiSet/Camera.png",
  "https://hyperlink-data.nyc3.cdn.digitaloceanspaces.com/icons/EmojiSet/Numbers.png",
  "https://hyperlink-data.nyc3.cdn.digitaloceanspaces.com/icons/EmojiSet/Crayon.png",
  "https://hyperlink-data.nyc3.cdn.digitaloceanspaces.com/icons/EmojiSet/House.png",
  "https://hyperlink-data.nyc3.cdn.digitaloceanspaces.com/icons/EmojiSet/Book.png",
  "https://hyperlink-data.nyc3.cdn.digitaloceanspaces.com/icons/EmojiSet/Present.png",
  "https://hyperlink-data.nyc3.cdn.digitaloceanspaces.com/icons/EmojiSet/Earth.png",
  "https://hyperlink-data.nyc3.cdn.digitaloceanspaces.com/icons/EmojiSet/Shapes.png",
  "https://hyperlink-data.nyc3.cdn.digitaloceanspaces.com/icons/EmojiSet/Heart.png",
  "https://hyperlink-data.nyc3.cdn.digitaloceanspaces.com/icons/EmojiSet/SpeechBubble.png",
];

export const IconPicker = (props: {
  icons: string[];
  setIcons: (icons: string[]) => void;
}) => {
  let icons = props.icons.filter((x) => !!x);
  return h(Box, { width: 400 }, [
    h(
      IconGrid,
      Icons.map((icon) =>
        h("img", {
          src: icon,
          alt: icon.split("/")[icon.length - 1],
          key: icon,
          onClick: () => {
            let newIcons = icons.slice(0);
            if (newIcons.length === 3) newIcons = [icon];
            else newIcons[newIcons.length] = icon;
            props.setIcons(newIcons);
          },
        })
      )
    ),
    h(Box, { gap: 8 }, [
      h(
        IconDisplay,
        icons.map((icon, index) => h("img", { key: index, src: icon }))
      ),
      h(
        LinkButton,
        {
          style: { justifySelf: "right" },
          type: "reset",
          onClick: () => {
            props.setIcons([]);
          },
        },
        "Clear"
      ),
    ]),
  ]);
};

const IconGrid = styled("div")`
  display: grid;
  grid-template-columns: repeat(auto-fill, 32px);
  grid-gap: 32px;
`;

const IconDisplay = styled("div")`
  box-sizing: border-box;
  height: 64px;
  background-color: white;
  display: grid;
  grid-template-columns: repeat(3, 32px);
  justify-content: center;
  grid-gap: 16px;
  padding: 16px;
  width: 100%;
  border: 1px solid;
`;
