import type { FileChild, ParagraphChild } from "docx";
import type { ChildNode } from "domhandler";
import type { SerializeOptions } from "../types";

type Children = FileChild[] | ParagraphChild[];

export interface IFallthroughSerializer<
  ChildrenType extends Children = Children,
> {
  /**
   * @returns the new children of the serialized element
   */
  serialize(options: SerializeOptions<ChildNode>): ChildrenType;
}
