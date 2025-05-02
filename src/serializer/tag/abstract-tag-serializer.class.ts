import type { FileChild, IRunOptions, ParagraphChild } from "docx";
import type { Element } from "domhandler";
import type { SerializeOptions } from "../types";
import type { ITagSerializer } from "./tag-serializer.interface";

export abstract class AbstractTagSerializer implements ITagSerializer {
  abstract selector: string;

  abstract getDisplay(node: Element | undefined): "inline" | "block";

  abstract serialize(
    options: SerializeOptions<Element>,
  ): FileChild | ParagraphChild[];

  getModifiers(node: Element | undefined): IRunOptions | undefined {
    return undefined;
  }
}
