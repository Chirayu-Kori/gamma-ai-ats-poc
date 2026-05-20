import { Text } from "@react-pdf/renderer";

import type { PdfStyles } from "./create-pdf-styles";
import { parseRichTextBlocks } from "./pdf-utils";

export function PdfRichText({
  html,
  styles,
}: {
  html: string;
  styles: PdfStyles;
}) {
  const blocks = parseRichTextBlocks(html);
  if (!blocks.length) return null;

  let paragraphIndex = 0;

  return (
    <>
      {blocks.map((block, blockIndex) => {
        if (block.type === "paragraph") {
          const style =
            paragraphIndex === 0 ? styles.bodyText : styles.bodyTextSpaced;
          paragraphIndex += 1;
          return (
            <Text key={`p-${blockIndex}`} style={style}>
              {block.text}
            </Text>
          );
        }

        if (block.type === "bulletList") {
          return block.items.map((item, itemIndex) => (
            <Text key={`ul-${blockIndex}-${itemIndex}`} style={styles.bullet}>
              • {item}
            </Text>
          ));
        }

        return block.items.map((item, itemIndex) => (
          <Text key={`ol-${blockIndex}-${itemIndex}`} style={styles.bullet}>
            {itemIndex + 1}. {item}
          </Text>
        ));
      })}
    </>
  );
}
