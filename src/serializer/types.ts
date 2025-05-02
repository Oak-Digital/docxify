import type { FileChild, IRunOptions, ParagraphChild } from "docx";
import type { ChildNode } from "domhandler";

/**
 * Options that are provided to the serializer.serialize() method
 */
export type SerializeOptions<
  Node extends ChildNode = ChildNode,
  Children extends ParagraphChild[] | FileChild[] = ParagraphChild[],
> = {
  /**
   * The html node to be serialized
   * If it is a fallback serializer, the element might be undefined
   */
  node?: Node;
  state?: {
    textModifiers?: IRunOptions;
  };
  /**
   * The already serialized children of the node
   */
  children: Children;
};
