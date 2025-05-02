import { Bookmark, type ParagraphChild } from "docx";
import type { Element } from "domhandler";
import type { SerializeOptions } from "../../types";
import type { IFallthroughSerializer } from "../fallthrough-serialzier.interface";

/**
 * For creating bookmarks for elements with an id
 */
export class IdSerializer implements IFallthroughSerializer<ParagraphChild[]> {
  readonly selector = "*[id]";

  serialize(options: SerializeOptions<Element>) {
    const { node, children } = options;
    const { id } = node?.attribs ?? {};

    if (!id) {
      return children;
    }

    return [
      new Bookmark({
        children,
        id,
      }),
    ];
  }
}
