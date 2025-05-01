import {
	FileChild,
	Paragraph,
	type IRunOptions,
	type ParagraphChild,
} from "docx";
import type { Element } from "domhandler";
import type { ITagSerializer } from "../tag-serializer.interface";
import { BlockTagSerializer } from "../block-tag-serializer.class";

export class ParagraphSerializer
	extends BlockTagSerializer
	implements ITagSerializer
{
	readonly selector: string = "p";

	serialize(
		node: Element | undefined,
		runOptions: IRunOptions,
		children: ParagraphChild[],
	): FileChild {
		return new Paragraph({
			// TODO: find a way to pass the runOptions to the paragraph
			// ...runOptions,
			children,
		});
	}
}
