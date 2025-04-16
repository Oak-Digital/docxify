import { TextRun, type XmlComponent } from "docx";
import type { ChildNode } from "domhandler";
import { ElementType } from "htmlparser2";

export class FallbackSerializer {
	selector: string = "*";

	serialize(
		element: ChildNode,
		next: (children: ChildNode[]) => XmlComponent[],
	): XmlComponent[] {
		// if (element.type === ElementType.Text) {
		// 	return new TextRun({
		// 		text: element.data,
		// 	})
		// }

		// return null;
		// return new TextRun({
		// 	text: element.children.map((child) => child.data).join(""),
		// });

		console.log(
			"FallbackSerializer",
			element.type,
			element.type === ElementType.Text
				? element.data
				: element.type === ElementType.Tag
					? element.tagName
					: element.type,
		);

		switch (element.type) {
			case ElementType.Text:
				return [
					new TextRun({
						text: element.data,
					}),
				];
			case ElementType.Tag:
			case ElementType.Root:
				// Render children
				return next(element.children);
			case ElementType.Style:
			// TODO: handle styles
			case ElementType.Script:
			case ElementType.Comment:
			case ElementType.Directive:
			case ElementType.CDATA:
				// Do nothing for these types
				return [];
		}
	}
}
