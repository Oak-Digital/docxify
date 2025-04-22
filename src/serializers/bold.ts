import type { IRunOptions, XmlComponent } from "docx";
import type { ITagSerializer, TagSerializerReturn } from "../tag-serializer";
import type { Element } from "domhandler";

export class BoldSerializer implements ITagSerializer {
	selector: string = "b, strong";

	serialize(element: Element): TagSerializerReturn {
		return {
			textModifier: {
				bold: true,
			},
		};
	}
}
