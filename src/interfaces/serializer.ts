import type { XmlComponent } from "docx";
import type { ChildNode } from "domhandler";

export interface Serializer<T extends ChildNode> {
	/**
	 * A css selector to match the element to be serialized.
	 * @example "strong"
	 * @example "p[data-foo='bar']"
	 */
	selector: string;

	/**
	 *
	 */
	serialize(element: T): XmlComponent;
}
