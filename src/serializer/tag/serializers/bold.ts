import type { IRunOptions } from "docx";
import type { Element } from "domhandler";
import { InlineTagSerializer } from "../inline-tag-serializer.class";
import type { IInlineTagSerializer } from "../inline-tag-serializer.interface";

export class BoldSerializer
  extends InlineTagSerializer
  implements IInlineTagSerializer
{
  selector = "b, strong";

  getModifiers(node: Element | undefined): IRunOptions | undefined {
    return {
      bold: true,
    };
  }
}
