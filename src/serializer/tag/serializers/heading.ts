import {
  type FileChild,
  type IRunOptions,
  Paragraph,
  type ParagraphChild,
} from "docx";
import type { Element } from "domhandler";
import { concat, join } from "string-ts";
import type { SerializeOptions } from "../../types";
import { BlockTagSerializer } from "../block-tag-serializer.class";
import type { IBlockTagSerializer } from "../block-tag-serializer.interface";

const levels = [1, 2, 3, 4, 5, 6] as const;
const elements = levels.map((level) => {
  const str = concat("h", level.toString() as `${typeof level}`);
  return str;
});

export class HeadingSerializer
  extends BlockTagSerializer
  implements IBlockTagSerializer
{
  readonly selector: string = elements.join(", ");

  serialize(options: SerializeOptions<Element>): FileChild[] {
    const { node, children } = options;
    const number = Number.parseInt(node?.tagName.slice(1) ?? "1", 10) || 1;
    const level = levels.find((level) => level === number) ?? 1;

    return [
      new Paragraph({
        heading: concat("Heading", level.toString() as `${typeof level}`),
        children,
      }),
    ];
  }
}
