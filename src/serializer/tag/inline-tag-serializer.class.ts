import type { FileChild, IRunOptions, ParagraphChild } from "docx";
import type { Element } from "domhandler";
import { AbstractTagSerializer } from "./abstract-tag-serializer.class";
import type { ITagSerializer } from "./tag/tag-serializer.interface";

export abstract class InlineTagSerializer
  extends AbstractTagSerializer
  implements ITagSerializer
{
  getDisplay(node: Element | undefined): "inline" {
    return "inline";
  }

  serialize(
    node: Element | undefined,
    runOptions: IRunOptions,
    children: ParagraphChild[],
  ): ParagraphChild[] | FileChild {
    return children;
  }
}
