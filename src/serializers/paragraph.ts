import type { ChildNode, Element } from "domhandler";
import type { Serializer } from "../interfaces/serializer";
import { Paragraph, type XmlComponent } from "docx";

type Next = (children: ChildNode[]) => XmlComponent[];

export class ParagraphSerializer /*implements Serializer<Element>*/ {
	selector: string = "p";

	serialize(element: Element, next: Next): XmlComponent[] {
		return [
			new Paragraph({
				children: next(element.children),
			}),
		];
	}
}
