import type { FileChild, IRunOptions, ParagraphChild } from "docx";
import type { ChildNode, Element } from "domhandler";
import type { SerializeOptions } from "../types";
import type { ITagSerializer } from "./tag-serializer.interface";

export interface IBlockTagSerializer extends ITagSerializer {
  readonly selector: string;

  /**
   * whether this is a block or inline tag
   * if it is a block tag, it must return a `FileChild` in the `serialize` method
   * if it is an inline tag, it must return a `ParagraphChild` array in the `serialize` method
   */
  getDisplay(node: Element | undefined): "block";

  /**
   * How this tag modifies text
   * for example a <b> tag will modify the text to be bold
   */
  getModifiers(node: Element | undefined): IRunOptions | undefined;

  serialize(options: SerializeOptions<Element>): FileChild;

  // /**
  //  * If the serializer handles some of the children, here you would return those not handled by the serializer.
  //  * The children will then be serialized and passed to the serialize() method.
  //  * By default it should return all children.
  //  */
  // childrenToPropagate(node: Element): ChildNode[];
}
