import type { FileChild, IRunOptions, ParagraphChild } from "docx";
import type { ChildNode, Element } from "domhandler";

export type TagSerializerReturn = {
	/**
	 * How this tag modifies text
	 * for example a <b> tag will modify the text to be bold
	 */
	textModifier?: IRunOptions;
	/**
	 * Some tags might create a new docx block.
	 * These might be tags such as paragraph, table, headings, etc.
	 */
	createBlock?: (
		children: (
			/**
			 * The unhandled children html nodes
			 */
			htmlNodes: ChildNode[],
		) => ParagraphChild[],
		runOptions: IRunOptions,
	) => FileChild;

	/**
	 * Some tags create docx inline elements.
	 * These might be tags such as img, <a>
	 */
	createInline?: (
		children: (
			/**
			 * The unhandled children html nodes
			 */
			htmlNodes: ChildNode[],
		) => ParagraphChild[],
		runOptions: IRunOptions,
	) => ParagraphChild | ParagraphChild[];
};

export interface ITagSerializer {
	selector: string;

	serialize(node: Element): TagSerializerReturn;
}
