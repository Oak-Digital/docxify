import type { IRunOptions } from "docx";
import type { Element } from "domhandler";
import { InlineTagSerializer } from "../inline-tag-serializer.class";
import type { ITagSerializer } from "../tag-serializer.interface";

export class BoldSerializer
	extends InlineTagSerializer
	implements ITagSerializer
{
	selector: string = "b, strong";

	getModifiers(node: Element | undefined): IRunOptions | undefined {
		return {
			bold: true,
		};
	}
}
