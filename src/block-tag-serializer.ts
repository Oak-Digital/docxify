import type { Element } from "domhandler";
import type { ITagSerializer } from "./tag-serializer";
import type { IRunOptions, ParagraphChild, FileChild } from "docx";
import { AbstractTagSerializer } from "./abstract-tag-serializer";

export abstract class BlockTagSerializer
	extends AbstractTagSerializer
	implements ITagSerializer
{
	getDisplay(node: Element): "block" {
		return "block";
	}

	abstract serialize(
		node: Element,
		runOptions: IRunOptions,
		children: ParagraphChild[],
	): FileChild;
}
