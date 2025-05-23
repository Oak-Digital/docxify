import { Table, TableRow } from "docx";
import type { Element } from "domhandler";
import type { SerializeOptions } from "../../../types";
import { AbstractTagSerializer } from "../../abstract-tag-serializer.class";
import type { ITagSerializer } from "../../tag-serializer.interface";

export class TableSerializer
  extends AbstractTagSerializer
  implements ITagSerializer
{
  getDisplay(node: Element | undefined): "table" {
    return "table";
  }
  readonly selector: string = "table";

  serialize(options: SerializeOptions<Element>): Table[] {
    // Make sure children are only table rows to avoid anything breaking
    const rows = options.children.filter((child) => {
      return child instanceof TableRow;
    });

    if (rows.length === 0) {
      return [];
    }

    return [
      new Table({
        rows,
        width: {
          type: "pct",
          size: "100%",
        },
        layout: "fixed",
      }),
    ];
  }
}
