import type { FileChild, IRunOptions, ParagraphChild } from "docx";
import type { Element } from "domhandler";
import type { ITagSerializer } from "./tag/tag-serializer.interface";

export abstract class AbstractTagSerializer implements ITagSerializer {
  abstract selector: string;

  abstract getDisplay(node: Element | undefined): "inline" | "block";

  abstract serialize(
    node: Element | undefined,
    runOptions: IRunOptions,
    children: ParagraphChild[],
  ): FileChild | ParagraphChild[];

  // abstract getModifiers(node: Element): IRunOptions | undefined;
  getModifiers(node: Element | undefined): IRunOptions | undefined {
    return undefined;
  }
}
