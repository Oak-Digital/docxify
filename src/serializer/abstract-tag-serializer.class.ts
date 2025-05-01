import type { FileChild, IRunOptions, ParagraphChild } from "docx";
import type { ITagSerializer } from "./tag-serializer.interface";
import type { Element } from "domhandler";

export abstract class AbstractTagSerializer implements ITagSerializer {
	abstract selector: string;

	abstract getDisplay(node: Element | undefined): "inline" | "block";

	abstract serialize(
		node: Element | undefined,
		runOptions: IRunOptions,
		children: ParagraphChild[],
	): FileChild | ParagraphChild[];

	// abstract getModifiers(node: Element): IRunOptions | undefined;
	getModifiers(node: Element | undefined): IRunOptions | undefined {
		return undefined;
	}
}
