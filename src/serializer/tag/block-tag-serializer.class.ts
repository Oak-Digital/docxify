import type { FileChild, IRunOptions, ParagraphChild } from "docx";
import type { Element } from "domhandler";
import type { SerializeOptions } from "../types";
import { AbstractTagSerializer } from "./abstract-tag-serializer.class";
import type { ITagSerializer } from "./tag-serializer.interface";

export abstract class BlockTagSerializer
  extends AbstractTagSerializer
  implements ITagSerializer
{
  getDisplay(node: Element | undefined): "block" {
    return "block";
  }

  abstract serialize(options: SerializeOptions<Element>): FileChild[];
}
