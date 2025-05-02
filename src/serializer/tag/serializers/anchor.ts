import { type IRunOptions, InternalHyperlink, type ParagraphChild } from "docx";
import type { Element } from "domhandler";
import type { SerializeOptions } from "../../types";
import { InlineTagSerializer } from "../inline-tag-serializer.class";
import type { IInlineTagSerializer } from "../inline-tag-serializer.interface";

export class AnchorSerializer
  extends InlineTagSerializer
  implements IInlineTagSerializer
{
  selector = "a";

  serialize(options: SerializeOptions<Element>): ParagraphChild[] {
    const { node, children } = options;
    const href = node?.attributes.find((attr) => attr.name === "href")?.value;
    if (!href) {
      return children;
    }
    return [
      new InternalHyperlink({
        anchor: href,
        children: children,
      }),
    ];
  }
}
