import type { IRunOptions } from "docx";
import { merge } from "lodash";
// import * as _ from "lodash";

export type State = {
	readonly textModifiers?: IRunOptions;
};

export type Node<Data = string> = {
	readonly type: "block" | "inline";
	// State should cascade to children
	readonly state?: State;
	readonly children: Node[];
	readonly data?: Data;
};

/**
 * extracts blocks to the top level
 */
export const flattenBlocksTree = (node: Node): Node[] => {
	const children = node.children;
	const isLeaf = children.length === 0;

	if (isLeaf) {
		return [node];
	}

	const flattenedChildren = children.flatMap((child) => {
		const flattened = flattenBlocksTree(child);

		return flattened;
	});

	const topLevel: Node[] = [];

	const createCurrent = (node: Node): Node => {
		return {
			...node,
			children: [],
		};
	};
	let current: Node = createCurrent(node);
	topLevel.push(current);

	flattenedChildren.forEach((child, i) => {
		if (child.type === "block") {
			topLevel.push({
				...child,
			});

			// if next is inline, create a new current
			const next = flattenedChildren[i + 1];
			if (next?.type === "inline") {
				current = createCurrent(node);
				topLevel.push(current);
			}
			return;
		}

		if (child.type === "inline") {
			current.children.push(child);
		}
	});

	return topLevel;
};
