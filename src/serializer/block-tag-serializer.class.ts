import type { Element } from "domhandler";
import type { ITagSerializer } from "./tag-serializer.interface";
import type { IRunOptions, ParagraphChild, FileChild } from "docx";
import { AbstractTagSerializer } from "./abstract-tag-serializer.class";

export abstract class BlockTagSerializer
	extends AbstractTagSerializer
	implements ITagSerializer
{
	getDisplay(node: Element | undefined): "block" {
		return "block";
	}

	abstract serialize(
		node: Element | undefined,
		runOptions: IRunOptions,
		children: ParagraphChild[],
	): FileChild;
}
