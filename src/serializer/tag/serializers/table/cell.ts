import { type FileChild, TableCell, TableRow } from "docx";
import type { Element } from "domhandler";
import type { SerializeOptions } from "../../../types";
import { AbstractTagSerializer } from "../../abstract-tag-serializer.class";
import { InlineTagSerializer } from "../../inline-tag-serializer.class";
import type { IInlineTagSerializer } from "../../inline-tag-serializer.interface";
import type { ITagSerializer } from "../../tag-serializer.interface";
import { tableRowSelectors } from "./row";

const selectors = tableRowSelectors.map((parent) => {
  return `${parent} > td, ${parent} > th`;
});

const selector = selectors.join(", ");

export class TableCellSerializer
  extends AbstractTagSerializer
  implements ITagSerializer
{
  readonly selector = selector;

  getDisplay(node: Element | undefined): "table-cell" {
    return "table-cell";
  }

  serialize(options: SerializeOptions<Element, FileChild[]>): TableCell[] {
    return [
      new TableCell({
        children: options.children,
        // width: {
        //   size: 5000,
        // }
      }),
    ];
  }
}
