import type { Element } from "domhandler";
import type { SerializeOptions } from "../../../types";
import { AbstractTagSerializer } from "../../abstract-tag-serializer.class";
import type { ITagSerializer } from "../../tag-serializer.interface";

export class TableChildSerializer
  extends AbstractTagSerializer
  implements ITagSerializer
{
  readonly selector = "table > tbody, table > thead, table > tfoot";

  getDisplay(node: Element | undefined): "table-child" {
    return "table-child";
  }

  serialize(options: SerializeOptions<Element>) {
    return options.children;
  }
}
