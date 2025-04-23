import type { Element } from "domhandler";
import type { ITagSerializer } from "./tag-serializer";
import type { IRunOptions, ParagraphChild, FileChild } from "docx";
import { AbstractTagSerializer } from "./abstract-tag-serializer";

export abstract class InlineTagSerializer
	extends AbstractTagSerializer
	implements ITagSerializer
{
	getDisplay(node: Element): "inline" {
		return "inline";
	}

	serialize(
		node: Element,
		runOptions: IRunOptions,
		children: ParagraphChild[],
	): ParagraphChild[] | FileChild {
		return children;
	}
}
