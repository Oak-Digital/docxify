import type { FileChild, IRunOptions, ParagraphChild } from "docx";
import type { ChildNode, Element } from "domhandler";

export interface ITagSerializer {
	readonly selector: string;

	/**
	 * whether this is a block or inline tag
	 * if it is a block tag, it must return a `FileChild` in the `serialize` method
	 * if it is an inline tag, it must return a `ParagraphChild` array in the `serialize` method
	 */
	getDisplay(node: Element): "inline" | "block";

	/**
	 * How this tag modifies text
	 * for example a <b> tag will modify the text to be bold
	 */
	getModifiers(node: Element): IRunOptions | undefined;

	serialize(
		/**
		 * The html node to be serialized
		 */
		node: Element,
		/**
		 * Options to be passed to the serialized element
		 */
		runOptions: IRunOptions,
		/**
		 * The already serialized children of the node
		 */
		children: ParagraphChild[],
	): ParagraphChild[] | FileChild;

	// /**
	//  * If the serializer handles some of the children, here you would return those not handled by the serializer.
	//  * The children will then be serialized and passed to the serialize() method.
	//  * By default it should return all children.
	//  */
	// childrenToPropagate(node: Element): ChildNode[];
}
