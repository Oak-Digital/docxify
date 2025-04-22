import { Paragraph } from "docx";
import type { Element } from "domhandler";
import type { ITagSerializer, TagSerializerReturn } from "../tag-serializer";

export class ParagraphSerializer implements ITagSerializer {
	readonly selector: string = "p";

	serialize(element: Element): TagSerializerReturn {
		return {
			createBlock: (children) => {
				return new Paragraph({
					children: children(element.children),
				});
			},
		};
	}
}
