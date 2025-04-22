import { ElementType } from "htmlparser2";
import { parseHtml } from "./html-to-json";
import { BoldSerializer } from "./serializers/bold";
import { ParagraphSerializer } from "./serializers/paragraph";
import type { ChildNode, Element } from "domhandler";
import {
	Document,
	FileChild,
	Packer,
	Paragraph,
	TextRun,
	type IRunOptions,
	type ParagraphChild,
} from "docx";
import { is } from "css-select";

const serializers = [
	new ParagraphSerializer(),
	new BoldSerializer(),
	// new FallbackSerializer(),
];

// const serialize = (elements: ChildNode[]) => {
// 	return elements.map((element) => {
// 		if (element.type !== ElementType.Tag) {
// 			// const fallbackSerializer = new FallbackSerializer();
// 			// return fallbackSerializer.serialize(element, serialize);
// 			// TODO: handle text nodes
// 			throw new Error("not implemented");
// 		}
//
// 		for (const serializer of serializers) {
// 			const isMatch = is(element, serializer.selector);
//
// 			if (isMatch) {
// 				const result = serializer.serialize(element);
// 				return result;
// 			}
// 		}
//
// 		return [];
// 	});
// };

type SerializerState = Readonly<{
	readonly textModifiers: IRunOptions;
	readonly isInParagraph: boolean;
}>;

const serializeElement = (
	element: Element,
	state: SerializerState,
):
	| {
			type: "inline";
			children: ParagraphChild[];
	  }
	| {
			type: "block";
			children: FileChild;
	  } => {
	const serializer = serializers.find((s) => {
		const isMatch = is(element, s.selector);
		return isMatch;
	});

	const serialized = serializer?.serialize(element);

	const newTextModifiers: IRunOptions = {
		...state.textModifiers,
		...serialized?.textModifier,
	} as const;

	// Should return a block or inline element

	const serializeChildren = (htmlNodes: ChildNode[]) => {
		const children = serializeNodes(htmlNodes, {
			...state,
			textModifiers: newTextModifiers,
		});
		return children.filter((child) => child !== undefined);
	};

	if (serialized?.createBlock) {
		const block = serialized.createBlock(serializeChildren, newTextModifiers);
		return {
			type: "block" as const,
			children: block,
		};
	}

	if (serialized?.createInline) {
		const inline = serialized.createInline(serializeChildren, newTextModifiers);
		return {
			type: "inline" as const,
			children: Array.isArray(inline) ? inline : [inline],
		};
	}

	// In case of no serializer found, we fallback to just rendering the children

	// return serializeChildren(element.children);
	return {
		type: "inline" as const,
		children: serializeChildren(element.children),
	};
};

const serializeNode = (element: ChildNode, state: SerializerState) => {
	let block: FileChild | null = null;
	let inlineNodes: ParagraphChild[] = [];

	switch (element.type) {
		case ElementType.Text:
			const textRun = new TextRun({
				...state.textModifiers,
				text: element.data,
			});
			inlineNodes = [textRun];
			break;

		case ElementType.Tag:
			const serialized = serializeElement(element, state);
			if (serialized.type === "block") {
				block = serialized.children;
			} else if (serialized.type === "inline") {
				inlineNodes = serialized.children;
			}
			break;

		default:
			break;
	}

	// if (block) {
	// 	return block;
	// }
	//
	// if (inlineNodes.length > 0) {
	// 	const paragraph = new Paragraph({
	// 		children: inlineNodes,
	// 	});
	// 	return paragraph;
	// }
};

const serializeNodes = (elements: ChildNode[], state: SerializerState) => {
	return elements.map((element) => {
		return serializeNode(element, state);
	});
};

export const generateDocx = async (html: string) => {
	const dom = await parseHtml(html);

	// console.log("dom", dom);
	const docxElements = serialize(dom).flat();

	// console.log("docxElements", docxElements);
	// const doc = new Document({
	// 	sections: [
	// 		{
	// 			children: [
	// 				new Paragraph({
	// 					children: docxElements,
	// 				}),
	// 			],
	// 		},
	// 	],
	// });

	const doc = new Document({
		sections: [],
	});

	return Packer.toBuffer(doc);
};
