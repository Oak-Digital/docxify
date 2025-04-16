import type { ChildNode, Element } from "domhandler";
import type { Serializer } from "../interfaces/serializer";
import { Paragraph, TextRun, type XmlComponent } from "docx";

type Next = (children: ChildNode[]) => XmlComponent[];

export class BoldSerializer /*implements Serializer<Element>*/ {
	selector: string = "b, strong";

	serialize(element: Element, next: Next): XmlComponent[] {
		return [
			new TextRun({
				bold: true,
				children: next(element.children),
			}),
		];
	}
}
