import { treeify } from "array-treeify";
import { is } from "css-select";
import {
  Document,
  type FileChild,
  type IRunOptions,
  Packer,
  Paragraph,
  type ParagraphChild,
  TextRun,
} from "docx";
import type { ChildNode, Element } from "domhandler";
import { ElementType } from "htmlparser2";
import { merge } from "lodash";
import { parseHtml } from "./html-to-json";
import { type Node, type State, flattenBlocksTree } from "./serialized-tree";
import { AnchorSerializer } from "./serializer/serializers/anchor";
import { BoldSerializer } from "./serializer/serializers/bold";
import { HeadingSerializer } from "./serializer/serializers/heading";
import { ItalicSerializer } from "./serializer/serializers/italic";
import { ParagraphSerializer } from "./serializer/serializers/paragraph";
import type { ITagSerializer } from "./serializer/tag-serializer.interface";
import { getArrayRanges, replaceArrayRanges } from "./util/array-ranges";

const serializers = [
  new HeadingSerializer(),
  new ParagraphSerializer(),
  new BoldSerializer(),
  new ItalicSerializer(),
  new AnchorSerializer(),
  // new FallbackSerializer(),
] as const satisfies ITagSerializer[];

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

const wrapTopLevelInlineElements = (elements: TreeNode[]): TreeNode[] => {
  const inlineRanges = getArrayRanges(elements, (element) => {
    return element.type === "inline";
  });

  const wrappedElements = replaceArrayRanges(
    elements,
    inlineRanges,
    (inlineElements) => {
      return [
        {
          type: "block",
          children: inlineElements,
        },
      ] as const;
    },
  );

  return wrappedElements;
};

const generateDocxStructuredTree = (elements: ChildNode[]): TreeNode[] => {
  const trees = elements
    .map((element) => buildTree(element))
    .filter((tree) => tree !== null);
  const flattened = trees.flatMap((tree) => flattenBlocksTree(tree));
  // Top level inline elements must be wrapped in paragraphs.
  // This is a requirement of docx.
  const wrapped = wrapTopLevelInlineElements(flattened);
  return wrapped;
};

const serializeDocxStructuredTreeInlineElement = (
  tree: TreeNode,
  parentState: State | undefined,
): ParagraphChild[] => {
  const element = tree.data?.element;

  // Base case

  const mergedState = merge({}, parentState, tree.state);

  if (element?.type === ElementType.Text) {
    return [
      new TextRun({
        ...mergedState?.textModifiers,
        text: element.data,
      }),
    ];
  }

  if (element?.type !== ElementType.Tag) {
    throw new Error("Elements which are not a tag are not supported for now");
  }

  const serializedChildren = tree.children.flatMap((child) => {
    return serializeDocxStructuredTreeInlineElement(child, mergedState);
  });

  const foundSerializer = element ? getSerializer(element) : null;

  if (!foundSerializer) {
    // just return serialized children
    return serializedChildren;
  }

  const serialized = foundSerializer.serialize(
    element,
    mergedState?.textModifiers ?? {},
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
  const foundSerializer = element
    ? getSerializer(element)
    : new ParagraphSerializer();
  // Fallback to default serializer for blocks
  const serializer = foundSerializer ?? new ParagraphSerializer();

  const serializedChildren = tree.children.flatMap((child) => {
    return serializeDocxStructuredTreeInlineElement(child, tree.state);
  });
  const serialized = serializer.serialize(
    element,
    tree.state?.textModifiers ?? {},
    serializedChildren,
    // TODO: remove type assertion
  ) as FileChild;

  return serialized;
};

const serializeDocxStructuredTree = (docxStructuredTree: TreeNode[]) => {
  // TODO: wrap top level inline elements in paragraphs
  if (docxStructuredTree.some((node) => node.type === "inline")) {
    console.debug("tree", docxStructuredTree);
    throw new Error("Inline elements are not supported for top level yet");
  }

  const blocks = docxStructuredTree
    .map((node) => {
      if (node.type === "block") {
        return seriaizeDocxStructuredTreeBlock(node);
      }
      return null;
    })
    .filter((block) => block !== null);

  return blocks;
};

const getNodeTitle = (node: TreeNode): string => {
  const stateString = JSON.stringify(node.state);
  if (node.data?.element.type === ElementType.Text) {
    return `Text - State: ${stateString} - "${node.data?.element.data}"`;
  }
  if (node.data?.element.type === ElementType.Tag) {
    return `${node.data?.element.tagName} - State: ${stateString}`;
  }

  return `Unknown ${node.type} - State: ${stateString}`;
};

type DebugTreeNode = (string | DebugTreeNode)[];

const buildDebugTree = (elements: TreeNode[]) => {
  const debugTree: DebugTreeNode = elements.flatMap((node) => {
    const title = getNodeTitle(node);
    if (node.children.length > 0) {
      return [title, buildDebugTree(node.children)];
    }
    return title;
  });

  return debugTree;
};

export const generateDocx = async (html: string) => {
  const dom = await parseHtml(html);

  const docxStructuredTree = generateDocxStructuredTree(dom);
  const serializedDocxTree = serializeDocxStructuredTree(docxStructuredTree);

  // console.log("docxStructuredTree", docxStructuredTree);
  const debugTree = buildDebugTree(docxStructuredTree);
  console.log(treeify(debugTree));

  const doc = new Document({
    sections: [
      {
        children: serializedDocxTree,
      },
    ],
  });

  // TODO: Make sure this can work in browser
  return Packer.toBuffer(doc);
};

// type SerializerState = Readonly<{
// 	readonly textModifiers: IRunOptions;
// }>;
//
// const serializeElement = (
// 	element: Element,
// 	state: SerializerState,
// ):
// 	| {
// 			type: "inline";
// 			children: ParagraphChild[];
// 	  }
// 	| {
// 			type: "block";
// 			children: FileChild;
// 	  } => {
// 	const serializer = serializers.find((s) => {
// 		const isMatch = is(element, s.selector);
// 		return isMatch;
// 	});
//
// 	const serialized = serializer?.serialize(element);
//
// 	const newTextModifiers: IRunOptions = {
// 		...state.textModifiers,
// 		...serialized?.textModifier,
// 	} as const;
//
// 	// Should return a block or inline element
//
// 	const serializeChildren = (htmlNodes: ChildNode[]) => {
// 		const children = serializeNodes(htmlNodes, {
// 			...state,
// 			textModifiers: newTextModifiers,
// 		});
// 		return children.filter((child) => child !== undefined);
// 	};
//
// 	if (serialized?.createBlock) {
// 		const block = serialized.createBlock(serializeChildren, newTextModifiers);
// 		return {
// 			type: "block" as const,
// 			children: block,
// 		};
// 	}
//
// 	if (serialized?.createInline) {
// 		const inline = serialized.createInline(serializeChildren, newTextModifiers);
// 		return {
// 			type: "inline" as const,
// 			children: Array.isArray(inline) ? inline : [inline],
// 		};
// 	}
//
// 	// In case of no serializer found, we fallback to just rendering the children
//
// 	// return serializeChildren(element.children);
// 	return {
// 		type: "inline" as const,
// 		children: serializeChildren(element.children),
// 	};
// };
//
// const serializeNode = (element: ChildNode, state: SerializerState) => {
// 	let block: FileChild | null = null;
// 	let inlineNodes: ParagraphChild[] = [];
//
// 	switch (element.type) {
// 		case ElementType.Text:
// 			const textRun = new TextRun({
// 				...state.textModifiers,
// 				text: element.data,
// 			});
// 			inlineNodes = [textRun];
// 			break;
//
// 		case ElementType.Tag:
// 			const serialized = serializeElement(element, state);
// 			if (serialized.type === "block") {
// 				block = serialized.children;
// 			} else if (serialized.type === "inline") {
// 				inlineNodes = serialized.children;
// 			}
// 			break;
//
// 		default:
// 			break;
// 	}
//
// 	// if (block) {
// 	// 	return block;
// 	// }
// 	//
// 	// if (inlineNodes.length > 0) {
// 	// 	const paragraph = new Paragraph({
// 	// 		children: inlineNodes,
// 	// 	});
// 	// 	return paragraph;
// 	// }
// };
//
// const serializeNodes = (elements: ChildNode[], state: SerializerState) => {
// 	return elements.map((element) => {
// 		return serializeNode(element, state);
// 	});
// };
//
// export const generateDocx = async (html: string) => {
// 	const dom = await parseHtml(html);
//
// 	// console.log("dom", dom);
// 	const docxElements = serialize(dom).flat();
//
// 	// console.log("docxElements", docxElements);
// 	// const doc = new Document({
// 	// 	sections: [
// 	// 		{
// 	// 			children: [
// 	// 				new Paragraph({
// 	// 					children: docxElements,
// 	// 				}),
// 	// 			],
// 	// 		},
// 	// 	],
// 	// });
//
// 	const doc = new Document({
// 		sections: [],
// 	});
//
// 	return Packer.toBuffer(doc);
// };
