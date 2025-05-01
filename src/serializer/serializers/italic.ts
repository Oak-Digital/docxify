import type { IRunOptions } from "docx";
import type { ITagSerializer } from "../tag-serializer";
import type { Element } from "domhandler";
import { InlineTagSerializer } from "../inline-tag-serializer";

export class ItalicSerializer
	extends InlineTagSerializer
	implements ITagSerializer
{
	selector: string = "em, i";

	getModifiers(node: Element | undefined): IRunOptions | undefined {
		return {
			italics: true,
		};
	}
}
