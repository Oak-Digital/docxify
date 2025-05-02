import { type IRunOptions, InternalHyperlink, type ParagraphChild } from "docx";
import type { Element } from "domhandler";
import { InlineTagSerializer } from "../inline-tag-serializer.class";
import type { ITagSerializer } from "../tag-serializer.interface";

export class AnchorSerializer
  extends InlineTagSerializer
  implements ITagSerializer
{
  selector = "a";

  serialize(
    node: Element | undefined,
    runOptions: IRunOptions,
    children: ParagraphChild[],
  ): ParagraphChild[] {
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
