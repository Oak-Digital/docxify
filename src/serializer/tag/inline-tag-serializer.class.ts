import type {
  FileChild,
  IRunOptions,
  ParagraphChild,
  TableCell,
  TableRow,
} from "docx";
import type { Element } from "domhandler";
import type { SerializeOptions } from "../types";
import { AbstractTagSerializer } from "./abstract-tag-serializer.class";
import type { IInlineTagSerializer } from "./inline-tag-serializer.interface";

export abstract class InlineTagSerializer
  extends AbstractTagSerializer
  implements IInlineTagSerializer
{
  getDisplay(node: Element | undefined): "inline" {
    return "inline";
  }

  serialize(options: SerializeOptions<Element>): ParagraphChild[] {
    return options.children;
  }
}
