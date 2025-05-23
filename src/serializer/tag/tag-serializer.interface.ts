import type {
  FileChild,
  IRunOptions,
  ParagraphChild,
  TableCell,
  TableRow,
} from "docx";
import type { ChildNode, Element } from "domhandler";
import type { SerializeOptions } from "../types";

export interface ITagSerializer {
  readonly selector: string;

  /**
   * whether this is a block or inline tag
   * if it is a block tag, it must return a `FileChild` in the `serialize` method
   * if it is an inline tag, it must return a `ParagraphChild` array in the `serialize` method
   */
  getDisplay(
    node: Element | undefined,
  ): "inline" | "block" | "table-row" | "table-cell" | "table" | "table-child";

  /**
   * How this tag modifies text
   * for example a <b> tag will modify the text to be bold
   */
  getModifiers(node: Element | undefined): IRunOptions | undefined;

  serialize(
    options: SerializeOptions<Element>,
  ): ParagraphChild[] | FileChild[] | TableRow[] | TableCell[];
}
