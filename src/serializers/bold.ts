import type { IRunOptions } from "docx";
import type { ITagSerializer } from "../tag-serializer";
import type { Element } from "domhandler";
import { InlineTagSerializer } from "../inline-tag-serializer";

export class BoldSerializer
	extends InlineTagSerializer
	implements ITagSerializer
{
	selector: string = "b, strong";

	getModifiers(node: Element): IRunOptions | undefined {
		return {
			bold: true,
		};
	}
}
