import {
	FileChild,
	Paragraph,
	type IRunOptions,
	type ParagraphChild,
} from "docx";
import { BlockTagSerializer } from "../block-tag-serializer.class";
import type { ITagSerializer } from "../tag-serializer.interface";
import type { Element } from "domhandler";
import { concat, join } from "string-ts";

const levels = [1, 2, 3, 4, 5, 6] as const;
const elements = levels.map((level) => {
	const str = concat("h", level.toString() as `${typeof level}`);
	return str;
});

export class HeadingSerializer
	extends BlockTagSerializer
	implements ITagSerializer
{
	readonly selector: string = elements.join(", ");

	serialize(
		node: Element | undefined,
		runOptions: IRunOptions,
		children: ParagraphChild[],
	): FileChild {
		const number = parseInt(node?.tagName.slice(1) ?? "1", 10) || 1;
		const level = levels.find((level) => level === number) ?? 1;

		return new Paragraph({
			heading: concat("Heading", level.toString() as `${typeof level}`),
			children,
		});
	}
}
