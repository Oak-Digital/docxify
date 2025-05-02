import { describe, expect, it } from "bun:test";
import { type Node, flattenBlocksTree } from "./serialized-tree";

describe("flattenBlocksTree", () => {
  it("should return a single element when there are no children", () => {
    const node = {
      type: "block",
      children: [],
      data: "1",
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
          data: "2",
          children: [],
        },
      ],
      data: "1",
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
          data: "2",
          children: [],
          state: { textModifiers: { bold: true } },
        },
      ],
      data: "1",
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
          data: "2",
          children: [
            {
              type: "inline",
              data: "3",
              children: [],
            },
          ],
        },
      ],
      data: "1",
    } as const satisfies Node;

    const result = flattenBlocksTree(node);

    expect(result).toEqual([node]);
  });

  it("should return a nested block at the top level", () => {
    const child = {
      type: "block",
      children: [],
      data: "2",
    } as const satisfies Node;
    const node = {
      type: "block",
      children: [child],
      data: "1",
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
      data: "2",
    } as const satisfies Node;

    const child2 = {
      type: "inline",
      children: [],
      data: "3",
    } as const satisfies Node;

    const node = {
      type: "block",
      children: [child1, child2],
      data: "1",
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
      data: "2",
    } as const satisfies Node;

    const block2 = {
      type: "block",
      children: [],
      data: "3",
    } as const satisfies Node;

    const inlineElem = {
      type: "inline",
      children: [],
      data: "4",
    } as const satisfies Node;

    const node = {
      type: "block",
      children: [block1, inlineElem, block2],
      data: "1",
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
      data: "2",
    } as const satisfies Node;

    const block2 = {
      type: "block",
      children: [],
      data: "3",
    } as const satisfies Node;

    const node = {
      type: "block",
      children: [block1, block2],
      data: "1",
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

  it("should extract blocks deeply nested within inline elements", () => {
    const baseInline: Node = {
      type: "inline",
      children: [],
    };

    const node = {
      type: "block",
      children: [
        baseInline,
        {
          type: "inline",
          children: [
            {
              type: "inline",
              children: [
                baseInline,
                {
                  type: "block",
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    } as const satisfies Node;

    const result = flattenBlocksTree(node);

    expect(result).toEqual([
      {
        ...node,
        children: [
          baseInline,
          {
            type: "inline",
            children: [
              {
                type: "inline",
                children: [baseInline],
              },
            ],
          },
        ],
      },
      {
        type: "block",
        children: [],
      },
    ]);
  });

  it("should repeat the same nesting of lines after a deeply nested block", () => {
    const baseInline: Node = {
      type: "inline",
      children: [],
    };

    const node = {
      type: "block",
      children: [
        baseInline,
        {
          type: "inline",
          children: [
            {
              type: "inline",
              children: [
                baseInline,
                {
                  type: "block",
                  children: [],
                },
                baseInline,
              ],
            },
          ],
        },
      ],
    } as const satisfies Node;

    const result = flattenBlocksTree(node);

    expect(result).toEqual([
      {
        ...node,
        children: [
          baseInline,
          {
            type: "inline",
            children: [
              {
                type: "inline",
                children: [baseInline],
              },
            ],
          },
        ],
      },
      {
        type: "block",
        children: [],
      },
      {
        ...node,
        children: [
          {
            type: "inline",
            children: [
              {
                type: "inline",
                children: [baseInline],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("should cascade state to deeply nested blocks", () => {
    const topState = { textModifiers: { bold: true } };
    const node = {
      type: "block",
      state: topState,
      children: [
        {
          type: "inline",
          children: [
            {
              type: "block",
              children: [],
            },
          ],
        },
      ],
      data: "1",
    } as const satisfies Node;

    const result = flattenBlocksTree(node);

    expect(result).toEqual([
      {
        type: "block",
        children: [
          {
            type: "inline",
            children: [],
          },
        ],
        data: "1",
        state: topState,
      },
      {
        type: "block",
        children: [],
        state: topState,
      },
    ]);
  });

  it("should cascade merge state to deeply nested blocks", () => {
    const topState = { textModifiers: { bold: true } };
    const node = {
      type: "block",
      state: topState,
      children: [
        {
          type: "inline",
          children: [
            {
              type: "block",
              state: { textModifiers: { italics: true } },
              children: [],
            },
          ],
        },
      ],
      data: "1",
    } as const satisfies Node;

    const result = flattenBlocksTree(node);

    expect(result).toEqual([
      {
        type: "block",
        children: [
          {
            type: "inline",
            children: [],
          },
        ],
        data: "1",
        state: topState,
      },
      {
        type: "block",
        children: [],
        state: { textModifiers: { bold: true, italics: true } },
      },
    ]);

    const node2 = {
      type: "block",
      state: topState,
      children: [
        {
          type: "inline",
          state: { textModifiers: { italics: true } },
          children: [
            {
              type: "block",
              children: [],
            },
          ],
        },
      ],
      data: "1",
    } as const satisfies Node;

    const result2 = flattenBlocksTree(node2);

    expect(result2).toEqual([
      {
        type: "block",
        state: topState,
        children: [
          {
            type: "inline",
            state: { textModifiers: { italics: true } },
            children: [],
          },
        ],
        data: "1",
      },
      {
        type: "block",
        children: [],
        state: { textModifiers: { bold: true, italics: true } },
      },
    ]);
  });

  it("should override state based on the deepest nested node", () => {
    const topState = { textModifiers: { bold: true } };
    const node = {
      type: "block",
      state: topState,
      children: [
        {
          type: "inline",
          children: [
            {
              type: "block",
              state: { textModifiers: { bold: false } },
              children: [],
            },
          ],
        },
      ],
      data: "1",
    } as const satisfies Node;

    const result = flattenBlocksTree(node);

    expect(result).toEqual([
      {
        type: "block",
        children: [
          {
            type: "inline",
            children: [],
          },
        ],
        data: "1",
        state: topState,
      },
      {
        type: "block",
        children: [],
        state: { textModifiers: { bold: false } },
      },
    ]);

    const node2 = {
      type: "block",
      state: topState,
      children: [
        {
          type: "inline",
          state: { textModifiers: { bold: false } },
          children: [
            {
              type: "block",
              children: [],
            },
          ],
        },
      ],
      data: "1",
    } as const satisfies Node;

    const result2 = flattenBlocksTree(node2);

    expect(result2).toEqual([
      {
        type: "block",
        state: topState,
        children: [
          {
            type: "inline",
            state: { textModifiers: { bold: false } },
            children: [],
          },
        ],
        data: "1",
      },
      {
        type: "block",
        children: [],
        state: { textModifiers: { bold: false } },
      },
    ]);
  });
});
