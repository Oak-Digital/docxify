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

	const topLevel: Node[] = [];

	const createCurrent = (node: Node): Node => {
		return {
			...node,
			children: [],
		};
	};
	let current: Node = createCurrent(node);
	topLevel.push(current);

	// go through children, if they are blocks, add them to the top level
	// if they are inline, add them to the current node

	for (let i = 0; i < children.length; i++) {
		const child = children[i]!;
		// const isLast = i === children.length - 1;

		if (child.type === "block") {
			const cascadedState =
				current.state || child.state
					? merge({}, current.state, child.state)
					: undefined;
			topLevel.push(
				...flattenBlocksTree({
					...child,
					state: cascadedState,
				}),
			);

			// if next is inline, create a new current
			const next = children[i + 1];
			if (next?.type === "inline") {
				current = createCurrent(node);
				topLevel.push(current);
			}
			continue;
		}

		if (child.type === "inline") {
			current.children.push(child);
		}
	}

	return topLevel;
};
