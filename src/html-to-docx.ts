import { ElementType } from "htmlparser2";
import { parseHtml } from "./html-to-json";
import { BoldSerializer } from "./serializers/bold";
import { FallbackSerializer } from "./serializers/fallback";
import { ParagraphSerializer } from "./serializers/paragraph";
import type { ChildNode } from "domhandler";
import { Document, Packer, Paragraph } from "docx";
import { is } from "css-select";

const serializers = [
	// new ParagraphSerializer(),
	new BoldSerializer(),
	new FallbackSerializer(),
];

const serialize = (elements: ChildNode[]) => {
	return elements.map((element) => {
		if (element.type !== ElementType.Tag) {
			const serializer = new FallbackSerializer();
			return serializer.serialize(element, serialize);
		}

		for (const serializer of serializers) {
			const isMatch = is(element, serializer.selector);

			if (isMatch) {
				const result = serializer.serialize(element, serialize);
				return result;
			}
		}

		return [];
	});
};

export const generateDocx = async (html: string) => {
	const dom = await parseHtml(html);

	// console.log("dom", dom);
	const docxElements = serialize(dom).flat();

	// console.log("docxElements", docxElements);
	const doc = new Document({
		sections: [
			{
				children: [
					new Paragraph({
						children: docxElements,
					}),
				],
			},
		],
	});

	return Packer.toBuffer(doc);
};
