import { InternalHyperlink, type ParagraphChild } from "docx";
import type { ITagSerializer, TagSerializerReturn } from "../tag-serializer";
import type { Element } from "domhandler";

export class AnchorSerializer implements ITagSerializer {
	selector: string = "a";

	serialize(element: Element): TagSerializerReturn {
		const href = element.attributes.find((attr) => attr.name === "href")?.value;
		return {
			createInline: href
				? (children) => {
						return new InternalHyperlink({
							anchor: href,
							children: children(element.children),
						});
					}
				: undefined,
		};
	}
}
