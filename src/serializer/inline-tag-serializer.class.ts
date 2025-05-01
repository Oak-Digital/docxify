import type { Element } from "domhandler";
import type { ITagSerializer } from "./tag-serializer.interface";
import type { IRunOptions, ParagraphChild, FileChild } from "docx";
import { AbstractTagSerializer } from "./abstract-tag-serializer.class";

export abstract class InlineTagSerializer
	extends AbstractTagSerializer
	implements ITagSerializer
{
	getDisplay(node: Element | undefined): "inline" {
		return "inline";
	}

	serialize(
		node: Element | undefined,
		runOptions: IRunOptions,
		children: ParagraphChild[],
	): ParagraphChild[] | FileChild {
		return children;
	}
}
