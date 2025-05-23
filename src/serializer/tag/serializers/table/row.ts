import { TableCell, TableRow } from "docx";
import type { Element } from "domhandler";
import type { SerializeOptions } from "../../../types";
import { AbstractTagSerializer } from "../../abstract-tag-serializer.class";
import type { ITagSerializer } from "../../tag-serializer.interface";

export const tableRowParents = [
  "table",
  "table > tbody",
  "table > thead",
  "table > tfoot",
] as const;

export const tableRowSelectors = tableRowParents.map((parent) => {
  return `${parent} > tr`;
});

const tableRowSelector = tableRowSelectors.join(", ");

export class TableRowSerializer
  extends AbstractTagSerializer
  implements ITagSerializer
{
  readonly selector = tableRowSelector;

  getDisplay(node: Element | undefined): "table-row" {
    return "table-row";
  }

  serialize(options: SerializeOptions<Element>): TableRow[] {
    const children = options.children.filter((child) => {
      return child instanceof TableCell;
    });

    return [
      new TableRow({
        children,
        // height: {
        //   value: 5000,
        //   rule: "exact",
        // },
      }),
    ];
  }
}
