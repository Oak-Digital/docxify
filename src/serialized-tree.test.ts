import { describe, it, expect } from "bun:test";
import { flattenBlocksTree, type Node } from "./serialized-tree";

describe("flattenBlocksTree", () => {
	it("should return a single element when there are no children", () => {
		const node = {
			type: "block",
			children: [],
			identifier: "1",
		} as const satisfies Node;

		const result = flattenBlocksTree(node);

		expect(result).toEqual([node]);
	});

	it("should return the same if there are only inline elements", () => {
		const node = {
			type: "inline",
			children: [
				{
					type: "inline",
					identifier: "2",
					children: [],
				},
			],
			identifier: "1",
		} as const satisfies Node;

		const result = flattenBlocksTree(node);

		expect(result).toEqual([node]);
	});

	it("should return the same if there are only inline elements with state", () => {
		const node = {
			type: "inline",
			children: [
				{
					type: "inline",
					identifier: "2",
					children: [],
					state: { textModifiers: { bold: true } },
				},
			],
			identifier: "1",
		} as const satisfies Node;

		const result = flattenBlocksTree(node);

		expect(result).toEqual([node]);
	});

	it("should return the same with deeply nested inline elements", () => {
		const node = {
			type: "inline",
			children: [
				{
					type: "inline",
					identifier: "2",
					children: [
						{
							type: "inline",
							identifier: "3",
							children: [],
						},
					],
				},
			],
			identifier: "1",
		} as const satisfies Node;

		const result = flattenBlocksTree(node);

		expect(result).toEqual([node]);
	});

	it("should return a nested block at the top level", () => {
		const child = {
			type: "block",
			children: [],
			identifier: "2",
		} as const satisfies Node;
		const node = {
			type: "block",
			children: [child],
			identifier: "1",
		} as const satisfies Node;

		const result = flattenBlocksTree(node);

		expect(result).toEqual([
			{
				...node,
				children: [],
			},
			child,
		]);
	});

	it("should repeat the original node at after block children if there are more children after the block child", () => {
		const child1 = {
			type: "block",
			children: [],
			identifier: "2",
		} as const satisfies Node;

		const child2 = {
			type: "inline",
			children: [],
			identifier: "3",
		} as const satisfies Node;

		const node = {
			type: "block",
			children: [child1, child2],
			identifier: "1",
		} as const satisfies Node;

		const result = flattenBlocksTree(node);

		expect(result).toEqual([
			{
				...node,
				children: [],
			},
			child1,
			{
				...node,
				children: [child2],
			},
		]);
	});

	it("should repeat the original node between block children if there are inline children between them", () => {
		const block1 = {
			type: "block",
			children: [],
			identifier: "2",
		} as const satisfies Node;

		const block2 = {
			type: "block",
			children: [],
			identifier: "3",
		} as const satisfies Node;

		const inlineElem = {
			type: "inline",
			children: [],
			identifier: "4",
		} as const satisfies Node;

		const node = {
			type: "block",
			children: [block1, inlineElem, block2],
			identifier: "1",
		} as const satisfies Node;

		const result = flattenBlocksTree(node);

		expect(result).toEqual([
			{
				...node,
				children: [],
			},
			block1,
			{
				...node,
				children: [inlineElem],
			},
			block2,
		]);
	});

	it("should not repeat the original node between block children if there are no inline children between them", () => {
		const block1 = {
			type: "block",
			children: [],
			identifier: "2",
		} as const satisfies Node;

		const block2 = {
			type: "block",
			children: [],
			identifier: "3",
		} as const satisfies Node;

		const node = {
			type: "block",
			children: [block1, block2],
			identifier: "1",
		} as const satisfies Node;

		const result = flattenBlocksTree(node);

		expect(result).toEqual([
			{
				...node,
				children: [],
			},
			block1,
			block2,
		]);
	});
});
