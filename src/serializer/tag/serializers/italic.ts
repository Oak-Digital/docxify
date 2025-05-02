import type { IRunOptions } from "docx";
import type { Element } from "domhandler";
import { InlineTagSerializer } from "../inline-tag-serializer.class";
import type { IInlineTagSerializer } from "../inline-tag-serializer.interface";

export class ItalicSerializer
  extends InlineTagSerializer
  implements IInlineTagSerializer
{
  selector = "em, i";

  getModifiers(node: Element | undefined): IRunOptions | undefined {
    return {
      italics: true,
    };
  }
}
