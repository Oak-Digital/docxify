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
import { AnchorSerializer } from "./serializers/anchor";
import { flattenBlocksTree, type Node, type State } from "./serialized-tree";
import type { ITagSerializer } from "./tag-serializer";

const serializers = [
	new ParagraphSerializer(),
	new BoldSerializer(),
	new AnchorSerializer(),
	// new FallbackSerializer(),
];

const getSerializer = (element: Element): ITagSerializer | null => {
	for (const serializer of serializers) {
		const isMatch = is(element, serializer.selector);

		if (isMatch) {
			return serializer;
		}
	}

	return null;
};

type NodeData = {
	element: ChildNode;
};

type TreeNode = Node<NodeData>;

const buildTree = (node: ChildNode): TreeNode | null => {
	if (node.type === ElementType.Text) {
		return {
			type: "inline",
			children: [],
			data: {
				element: node,
			},
		};
	}

	if (node.type !== ElementType.Tag) {
		return null;
	}

	const childNodes = node.children
		.map((child) => {
			return buildTree(child);
		})
		.filter((child) => child !== null);

	const serializer = getSerializer(node);
	const textModifiers = serializer?.getModifiers(node);
	const display = serializer?.getDisplay(node) ?? "inline";

	const tree: TreeNode = {
		children: childNodes,
		type: display,
		state: {
			textModifiers,
		},
		data: {
			element: node,
		},
	};

	return tree;
};

const generateDocxStructuredTree = (elements: ChildNode[]): TreeNode[] => {
	const trees = elements
		.map((element) => buildTree(element))
		.filter((tree) => tree !== null);
	const flattened = trees.flatMap((tree) => flattenBlocksTree(tree));
	return flattened;
};

const serializeDocxStructuredTreeInlineElement = (
	tree: TreeNode,
	state: State | undefined,
): ParagraphChild[] => {
	const element = tree.data?.element;

	if (!element) {
		throw new Error("Element has to be defined for now");
	}

	// Base case

	if (element?.type === ElementType.Text) {
		return [
			new TextRun({
				...state?.textModifiers,
				text: element.data,
			}),
		];
	}

	if (element?.type !== ElementType.Tag) {
		throw new Error("Elements which are not a tag are not supported for now");
	}

	const serializedChildren = tree.children
		.map((child) => {
			return serializeDocxStructuredTreeInlineElement(child, state);
		})
		.flat();

	const foundSerializer = element ? getSerializer(element) : null;

	if (!foundSerializer) {
		// just return serialized children
		return serializedChildren;
	}

	const serialized = foundSerializer.serialize(
		element,
		state?.textModifiers ?? {},
		serializedChildren,
		// TODO: remove type assertion
	) as ParagraphChild[];

	return serialized;
};

const seriaizeDocxStructuredTreeBlock = (tree: TreeNode): FileChild => {
	const element = tree.data?.element;
	if (element && element.type !== ElementType.Tag) {
		throw new Error("Element is not a tag");
	}
	if (!element) {
		throw new Error("Element has to be defined for now");
	}
	const foundSerializer = element ? getSerializer(element) : null;
	// Fallback to default serializer for blocks
	const serializer = foundSerializer ?? new ParagraphSerializer();

	const serializedChildren = tree.children.map((child) => {
		return serializeDocxStructuredTreeInlineElement(child, tree.state);
	});
	const serialized = serializer.serialize(
		element,
		tree.state?.textModifiers ?? {},
		[],
		// TODO: remove type assertion
	) as FileChild;

	return serialized;
};

const serializeDocxStructuredTree = (tree: TreeNode[]) => {
	// TODO: wrap top level inline elements in paragraphs
	if (tree.some((node) => node.type === "inline")) {
		throw new Error("Inline elements are not supported for top level yet");
	}

	const blocks = tree
		.map((node) => {
			if (node.type === "block") {
				return seriaizeDocxStructuredTreeBlock(node);
			}
			return null;
		})
		.filter((block) => block !== null);

	return blocks;
};

type SerializerState = Readonly<{
	readonly textModifiers: IRunOptions;
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
