import type { IRunOptions, ParagraphChild, TableCell, TableRow } from "docx";
import type { Element } from "domhandler";
import type { SerializeOptions } from "../types";
import type { ITagSerializer } from "./tag-serializer.interface";

export interface IInlineTagSerializer extends ITagSerializer {
  getDisplay(node: Element | undefined): "inline";

  /**
   * How this tag modifies text
   * for example a <b> tag will modify the text to be bold
   */
  getModifiers(node: Element | undefined): IRunOptions | undefined;

  serialize(options: SerializeOptions<Element>): ParagraphChild[];

  // /**
  //  * If the serializer handles some of the children, here you would return those not handled by the serializer.
  //  * The children will then be serialized and passed to the serialize() method.
  //  * By default it should return all children.
  //  */
  // childrenToPropagate(node: Element): ChildNode[];
}
