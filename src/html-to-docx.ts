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
import type { IFallthroughSerializer } from "./serializer/fallthrough/fallthrough-serialzier.interface";
import { IdSerializer } from "./serializer/fallthrough/serializers/id";
import { AnchorSerializer } from "./serializer/tag/serializers/anchor";
import { BoldSerializer } from "./serializer/tag/serializers/bold";
import { HeadingSerializer } from "./serializer/tag/serializers/heading";
import { ItalicSerializer } from "./serializer/tag/serializers/italic";
import { ParagraphSerializer } from "./serializer/tag/serializers/paragraph";
import {
  TableCellSerializer,
  TableRowSerializer,
  TableSerializer,
  tableSerializers,
} from "./serializer/tag/serializers/table";
import type { ITagSerializer } from "./serializer/tag/tag-serializer.interface";
import { getArrayRanges, replaceArrayRanges } from "./util/array-ranges";
import {
  type StateDataTreeNode,
  extractToTopLevel,
} from "./util/state-data-tree";

type Serializers = ITagSerializer[];

const serializers = [
  ...tableSerializers,
  new HeadingSerializer(),
  new ParagraphSerializer(),
  new BoldSerializer(),
  new ItalicSerializer(),
  new AnchorSerializer(),
  // new FallbackSerializer(),
] as const satisfies Serializers;

const fallthroughSerializers = [
  new IdSerializer(),
] as const satisfies IFallthroughSerializer[];

const getSerializer = (
  element: Element,
  serializers: Serializers,
): ITagSerializer | null => {
  for (const serializer of serializers) {
    const isMatch = is(element, serializer.selector);

    if (isMatch) {
      return serializer;
    }
  }

  return null;
};

type NodeData = {
  element?: ChildNode;
  type:
    | "block"
    | "inline"
    | "table-row"
    | "table-cell"
    | "table"
    | "table-child";
};

type NodeState = {
  textModifiers?: IRunOptions;
};

// type TreeNode = Node<NodeData>;
type TreeNode = StateDataTreeNode<NodeData, NodeState>;

const buildTree = (node: ChildNode): TreeNode | null => {
  if (node.type === ElementType.Text) {
    return {
      children: [],
      data: {
        element: node,
        type: "inline",
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

  const serializer = getSerializer(node, serializers);
  const textModifiers = serializer?.getModifiers(node);
  const display = serializer?.getDisplay(node) ?? "inline";

  const tree: TreeNode = {
    children: childNodes,
    state: {
      textModifiers,
    },
    data: {
      element: node,
      type: display,
    },
  };

  return tree;
};

const wrapTopLevelInlineElements = (elements: TreeNode[]): TreeNode[] => {
  const inlineRanges = getArrayRanges(elements, (element) => {
    return element.data?.type === "inline";
  });

  const wrappedElements = replaceArrayRanges(
    elements,
    inlineRanges,
    (inlineElements) => {
      return [
        {
          children: inlineElements,
          data: {
            type: "block",
          },
        },
      ] as const;
    },
  );

  return wrappedElements;
};

const rebuildTree = (
  elements: TreeNode[],
  callback: (nodes: TreeNode[]) => TreeNode[],
): TreeNode[] => {
  const newTree = elements.flatMap((node) => {
    const newChildren = rebuildTree(node.children, callback);
    const newNode = {
      ...node,
      children: newChildren,
    };

    return [newNode];
  });

  const newTreeModifiedTree = callback(newTree);

  return newTreeModifiedTree;
};

const wrapTableCellInlineElements = (elements: TreeNode[]): TreeNode[] => {
  const newElements = rebuildTree(elements, (nodes) => {
    return nodes.flatMap((node) => {
      if (node.data?.type !== "table-cell") {
        return node;
      }

      // now we have a table cell which should be wrapped in a paragraph
      const wrapped = wrapTopLevelInlineElements(node.children);

      return {
        ...node,
        children: wrapped,
      };
    });
  });

  return newElements;
};

const generateDocxStructuredTree = (elements: ChildNode[]): TreeNode[] => {
  const trees = elements
    .map((element) => buildTree(element))
    .filter((tree) => tree !== null);
  const isBlock = (tree: TreeNode) => tree.data?.type === "block";
  const shouldExtract = (node: TreeNode, child: TreeNode) => {
    // we do not want to extract anything out of a table cell since they support having blocks inside them
    if (node.data?.type === "table-cell") {
      return false;
    }

    // we want to extract everything out of a table row except for the table cells
    if (node.data?.type === "table-row") {
      return child.data?.type !== "table-cell";
    }

    if (node.data?.type === "table-child") {
      return child.data?.type !== "table-row";
    }

    // we also want to extract everything but table rows and thead, tbody, tfoot out of a table
    if (node.data?.type === "table") {
      // return child.data?.type !== "table-row";
      return (
        child.data?.type !== "table-row" && child.data?.type !== "table-child"
      );
    }

    return isBlock(child);
  };
  const flattened = trees.flatMap((tree) =>
    extractToTopLevel(tree, shouldExtract),
  );
  // Also wrap top level inline elements in table cells
  const withWrappedTableCells = wrapTableCellInlineElements(flattened);

  // Top level inline elements must be wrapped in paragraphs.
  // This is a requirement of docx.
  const wrapped = wrapTopLevelInlineElements(withWrappedTableCells);
  // const wrapped = wrapTopLevelInlineElements(flattened);

  return wrapped;
};

const serializeDocxStructuredTreeNode = (
  tree: TreeNode,
  parentState?: NodeState | undefined,
) => {
  const element = tree.data?.element;
  const mergedState = merge({}, parentState, tree.state);

  if (element?.type === ElementType.Text) {
    return [
      new TextRun({
        ...mergedState?.textModifiers,
        text: element.data,
      }),
    ];
  }
  if (element && element.type !== ElementType.Tag) {
    throw new Error("Element is not a tag");
  }
  const foundSerializer = element
    ? getSerializer(element, serializers)
    : new ParagraphSerializer();
  // Fallback to default serializer for blocks
  const serializer = foundSerializer ?? new ParagraphSerializer();

  const foundFallthroughSerializers = element
    ? fallthroughSerializers.filter((s) => {
        const isMatch = is(element, s.selector);
        return isMatch;
      })
    : [];

  const serializedChildren = tree.children.flatMap((child) => {
    // return serializeDocxStructuredTreeInlineElement(child, tree.state);
    return serializeDocxStructuredTreeNode(child, mergedState);
  });

  const serializedChildrenWithFallthrough = foundFallthroughSerializers.reduce(
    (acc, serializer) => {
      const serialized = serializer.serialize({
        node: element,
        state: tree.state,
        children: acc,
      });
      return serialized;
    },
    serializedChildren,
  );

  const serialized = serializer.serialize(
    {
      node: element,
      state: tree.state,
      children: serializedChildrenWithFallthrough,
    },
    // TODO: remove type assertion
  );

  return serialized;
};

const serializeDocxStructuredTree = (docxStructuredTree: TreeNode[]) => {
  // TODO: wrap top level inline elements in paragraphs
  if (docxStructuredTree.some((node) => node.data?.type === "inline")) {
    console.debug("tree", docxStructuredTree);
    throw new Error("Inline elements are not supported for top level yet");
  }

  const blocks = docxStructuredTree
    .flatMap((node) => {
      return serializeDocxStructuredTreeNode(node);
    })
    .filter((block) => block !== null);

  return blocks;
};

const getNodeTitle = (node: TreeNode): string => {
  const stateString = JSON.stringify(node.state);
  if (node.data?.element?.type === ElementType.Text) {
    return `Text - State: ${stateString} - "${node.data.element.data}"`;
  }
  if (node.data?.element?.type === ElementType.Tag) {
    return `${node.data.element.tagName} - State: ${stateString}`;
  }

  return `Unknown ${node.data?.type} - State: ${stateString}`;
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

export const generateDocxFromDom = async (dom: ChildNode[]) => {
  const docxStructuredTree = generateDocxStructuredTree(dom);
  // console.log("docxStructuredTree", docxStructuredTree);
  // const debugTree = buildDebugTree(docxStructuredTree);
  // console.log(treeify(debugTree));
  const serializedDocxTree = serializeDocxStructuredTree(docxStructuredTree);

  const doc = new Document({
    sections: [
      {
        // TODO: Do not use type assertion
        children: serializedDocxTree as FileChild[],
      },
    ],
  });

  return {
    toBuffer: () => {
      return Packer.toBuffer(doc);
    },
    toBlob: () => {
      return Packer.toBlob(doc);
    },
  };
};

export const generateDocx = async (html: string) => {
  const dom = await parseHtml(html);

  return generateDocxFromDom(dom);
};
