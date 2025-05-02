import { describe, expect, it } from "bun:test";
import { type StateDataTreeNode, extractToTopLevel } from "./state-data-tree";

type BasicData = {
  type?: "block" | "inline";
  data?: string;
};

type Node = StateDataTreeNode<BasicData>;

const createEmptyNode = () => {
  return {
    children: [],
    data: {
      type: "block",
      data: "1",
    },
  } as const satisfies Node;
};

const isBlock = (node: Node) => {
  if (!node.data?.type) {
    console.error("Node has no type");
    return false;
  }
  return node.data?.type === "block";
};

describe("extractToTopLevel", () => {
  it("should return a single element when there are no children", () => {
    const node = createEmptyNode();

    const result = extractToTopLevel(node, isBlock);

    expect(result).toEqual([node]);
  });

  it("should return the same if there are only inline elements", () => {
    // const node = {
    //   type: "inline",
    //   children: [
    //     {
    //       type: "inline",
    //       data: "2",
    //       children: [],
    //     },
    //   ],
    //   data: "1",
    // } as const satisfies Node;
    //
    // const result = flattenBlocksTree(node);

    const node: Node = {
      children: [
        {
          data: {
            type: "inline",
            data: "2",
          },
          children: [],
        },
      ],
      data: {
        type: "inline",
        data: "1",
      },
    };

    const result = extractToTopLevel(node, isBlock);

    expect(result).toEqual([node]);
  });

  it("should return the same if there are only inline elements with state", () => {
    // const node = {
    //   type: "inline",
    //   children: [
    //     {
    //       type: "inline",
    //       data: "2",
    //       children: [],
    //       state: { textModifiers: { bold: true } },
    //     },
    //   ],
    //   data: "1",
    // } as const satisfies Node;

    const node: Node = {
      children: [
        {
          data: {
            type: "inline",
            data: "2",
          },
          state: { textModifiers: { bold: true } },
          children: [],
        },
      ],
      data: {
        type: "inline",
        data: "1",
      },
    };

    const result = extractToTopLevel(node, isBlock);

    expect(result).toEqual([node]);
  });

  it("should return the same with deeply nested inline elements", () => {
    // const node = {
    //   type: "inline",
    //   children: [
    //     {
    //       type: "inline",
    //       data: "2",
    //       children: [
    //         {
    //           type: "inline",
    //           data: "3",
    //           children: [],
    //         },
    //       ],
    //     },
    //   ],
    //   data: "1",
    // } as const satisfies Node;
    //
    // const result = flattenBlocksTree(node);

    const node: Node = {
      children: [
        {
          data: {
            type: "inline",
            data: "2",
          },
          children: [
            {
              data: {
                type: "inline",
                data: "3",
              },
              children: [],
            },
          ],
        },
      ],
      data: {
        type: "inline",
        data: "1",
      },
    };

    const result = extractToTopLevel(node, isBlock);

    expect(result).toEqual([node]);
  });

  it("should return a nested block at the top level", () => {
    // const child = {
    //   type: "block",
    //   children: [],
    //   data: "2",
    // } as const satisfies Node;
    // const node = {
    //   type: "block",
    //   children: [child],
    //   data: "1",
    // } as const satisfies Node;
    //
    // const result = flattenBlocksTree(node);

    const child: Node = {
      data: {
        type: "block",
        data: "2",
      },
      children: [],
    };
    const node: Node = {
      data: {
        type: "block",
        data: "1",
      },
      children: [child],
    };

    const result = extractToTopLevel(node, isBlock);

    expect(result).toEqual([
      {
        ...node,
        children: [],
      },
      child,
    ]);
  });

  it("should repeat the original node at after block children if there are more children after the block child", () => {
    // const child1 = {
    //   type: "block",
    //   children: [],
    //   data: "2",
    // } as const satisfies Node;
    //
    // const child2 = {
    //   type: "inline",
    //   children: [],
    //   data: "3",
    // } as const satisfies Node;
    //
    // const node = {
    //   type: "block",
    //   children: [child1, child2],
    //   data: "1",
    // } as const satisfies Node;
    //
    // const result = flattenBlocksTree(node);

    const child1: Node = {
      data: {
        type: "block",
        data: "2",
      },
      children: [],
    };
    const child2: Node = {
      data: {
        type: "inline",
        data: "3",
      },
      children: [],
    };
    const node: Node = {
      data: {
        type: "block",
        data: "1",
      },
      children: [child1, child2],
    };

    const result = extractToTopLevel(node, isBlock);

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
    // const block1 = {
    //   type: "block",
    //   children: [],
    //   data: "2",
    // } as const satisfies Node;
    //
    // const block2 = {
    //   type: "block",
    //   children: [],
    //   data: "3",
    // } as const satisfies Node;
    //
    // const inlineElem = {
    //   type: "inline",
    //   children: [],
    //   data: "4",
    // } as const satisfies Node;
    //
    // const node = {
    //   type: "block",
    //   children: [block1, inlineElem, block2],
    //   data: "1",
    // } as const satisfies Node;
    //
    // const result = flattenBlocksTree(node);

    const block1: Node = {
      data: {
        type: "block",
        data: "2",
      },
      children: [],
    };
    const block2: Node = {
      data: {
        type: "block",
        data: "3",
      },
      children: [],
    };
    const inlineElem: Node = {
      data: {
        type: "inline",
        data: "4",
      },
      children: [],
    };
    const node: Node = {
      data: {
        type: "block",
        data: "1",
      },
      children: [block1, inlineElem, block2],
    };
    const result = extractToTopLevel(node, isBlock);

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
    // const block1 = {
    //   type: "block",
    //   children: [],
    //   data: "2",
    // } as const satisfies Node;
    //
    // const block2 = {
    //   type: "block",
    //   children: [],
    //   data: "3",
    // } as const satisfies Node;
    //
    // const node = {
    //   type: "block",
    //   children: [block1, block2],
    //   data: "1",
    // } as const satisfies Node;
    //
    // const result = flattenBlocksTree(node);

    const block1: Node = {
      data: {
        type: "block",
        data: "2",
      },
      children: [],
    };

    const block2: Node = {
      data: {
        type: "block",
        data: "3",
      },
      children: [],
    };

    const node: Node = {
      data: {
        type: "block",
        data: "1",
      },
      children: [block1, block2],
    };

    const result = extractToTopLevel(node, isBlock);

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
    // const baseInline: Node = {
    //   type: "inline",
    //   children: [],
    // };
    //
    // const node = {
    //   type: "block",
    //   children: [
    //     baseInline,
    //     {
    //       type: "inline",
    //       children: [
    //         {
    //           type: "inline",
    //           children: [
    //             baseInline,
    //             {
    //               type: "block",
    //               children: [],
    //             },
    //           ],
    //         },
    //       ],
    //     },
    //   ],
    // } as const satisfies Node;
    //
    // const result = flattenBlocksTree(node);

    const baseInline: Node = {
      data: {
        type: "inline",
      },
      children: [],
    };
    const node: Node = {
      data: {
        type: "block",
      },
      children: [
        baseInline,
        {
          data: {
            type: "inline",
          },
          children: [
            {
              data: {
                type: "inline",
              },
              children: [
                baseInline,
                {
                  data: {
                    type: "block",
                  },
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    };

    const result = extractToTopLevel(node, isBlock);

    // expect(result).toEqual([
    //   {
    //     ...node,
    //     children: [
    //       baseInline,
    //       {
    //         type: "inline",
    //         children: [
    //           {
    //             type: "inline",
    //             children: [baseInline],
    //           },
    //         ],
    //       },
    //     ],
    //   },
    //   {
    //     type: "block",
    //     children: [],
    //   },
    // ]);

    expect(result).toEqual([
      {
        ...node,
        children: [
          baseInline,
          {
            data: {
              type: "inline",
            },
            children: [
              {
                data: {
                  type: "inline",
                },
                children: [baseInline],
              },
            ],
          },
        ],
      },
      {
        data: {
          type: "block",
        },
        children: [],
      },
    ]);
  });

  it("should repeat the same nesting of lines after a deeply nested block", () => {
    // const baseInline: Node = {
    //   type: "inline",
    //   children: [],
    // };
    //
    // const node = {
    //   type: "block",
    //   children: [
    //     baseInline,
    //     {
    //       type: "inline",
    //       children: [
    //         {
    //           type: "inline",
    //           children: [
    //             baseInline,
    //             {
    //               type: "block",
    //               children: [],
    //             },
    //             baseInline,
    //           ],
    //         },
    //       ],
    //     },
    //   ],
    // } as const satisfies Node;
    //
    // const result = flattenBlocksTree(node);
    //
    // expect(result).toEqual([
    //   {
    //     ...node,
    //     children: [
    //       baseInline,
    //       {
    //         type: "inline",
    //         children: [
    //           {
    //             type: "inline",
    //             children: [baseInline],
    //           },
    //         ],
    //       },
    //     ],
    //   },
    //   {
    //     type: "block",
    //     children: [],
    //   },
    //   {
    //     ...node,
    //     children: [
    //       {
    //         type: "inline",
    //         children: [
    //           {
    //             type: "inline",
    //             children: [baseInline],
    //           },
    //         ],
    //       },
    //     ],
    //   },
    // ]);

    const baseInline: Node = {
      data: {
        type: "inline",
      },
      children: [],
    };

    const node: Node = {
      data: {
        type: "block",
      },
      children: [
        baseInline,
        {
          data: {
            type: "inline",
          },
          children: [
            {
              data: {
                type: "inline",
              },
              children: [
                baseInline,
                {
                  data: {
                    type: "block",
                  },
                  children: [],
                },
                baseInline,
              ],
            },
          ],
        },
      ],
    };
    const result = extractToTopLevel(node, isBlock);

    expect(result).toEqual([
      {
        ...node,
        children: [
          baseInline,
          {
            data: {
              type: "inline",
            },
            children: [
              {
                data: {
                  type: "inline",
                },
                children: [baseInline],
              },
            ],
          },
        ],
      },
      {
        data: {
          type: "block",
        },
        children: [],
      },
      {
        ...node,
        children: [
          {
            data: {
              type: "inline",
            },
            children: [
              {
                data: {
                  type: "inline",
                },
                children: [baseInline],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("should cascade state to deeply nested blocks", () => {
    // const topState = { textModifiers: { bold: true } };
    // const node = {
    //   type: "block",
    //   state: topState,
    //   children: [
    //     {
    //       type: "inline",
    //       children: [
    //         {
    //           type: "block",
    //           children: [],
    //         },
    //       ],
    //     },
    //   ],
    //   data: "1",
    // } as const satisfies Node;
    //
    // const result = flattenBlocksTree(node);
    //
    // expect(result).toEqual([
    //   {
    //     type: "block",
    //     children: [
    //       {
    //         type: "inline",
    //         children: [],
    //       },
    //     ],
    //     data: "1",
    //     state: topState,
    //   },
    //   {
    //     type: "block",
    //     children: [],
    //     state: topState,
    //   },
    // ]);

    const topState = { textModifiers: { bold: true } };
    const node: Node = {
      data: {
        type: "block",
        data: "1",
      },
      state: topState,
      children: [
        {
          data: {
            type: "inline",
          },
          children: [
            {
              data: {
                type: "block",
              },
              children: [],
            },
          ],
        },
      ],
    };

    const result = extractToTopLevel(node, isBlock);

    expect(result).toEqual([
      {
        ...node,
        children: [
          {
            data: {
              type: "inline",
            },
            children: [],
          },
        ],
      },
      {
        data: {
          type: "block",
        },
        children: [],
        state: topState,
      },
    ]);
  });

  it("should cascade merge state to deeply nested blocks", () => {
    // const topState = { textModifiers: { bold: true } };
    // const node = {
    //   type: "block",
    //   state: topState,
    //   children: [
    //     {
    //       type: "inline",
    //       children: [
    //         {
    //           type: "block",
    //           state: { textModifiers: { italics: true } },
    //           children: [],
    //         },
    //       ],
    //     },
    //   ],
    //   data: "1",
    // } as const satisfies Node;
    //
    // const result = flattenBlocksTree(node);
    //
    // expect(result).toEqual([
    //   {
    //     type: "block",
    //     children: [
    //       {
    //         type: "inline",
    //         children: [],
    //       },
    //     ],
    //     data: "1",
    //     state: topState,
    //   },
    //   {
    //     type: "block",
    //     children: [],
    //     state: { textModifiers: { bold: true, italics: true } },
    //   },
    // ]);
    //
    // const node2 = {
    //   type: "block",
    //   state: topState,
    //   children: [
    //     {
    //       type: "inline",
    //       state: { textModifiers: { italics: true } },
    //       children: [
    //         {
    //           type: "block",
    //           children: [],
    //         },
    //       ],
    //     },
    //   ],
    //   data: "1",
    // } as const satisfies Node;
    //
    // const result2 = flattenBlocksTree(node2);
    //
    // expect(result2).toEqual([
    //   {
    //     type: "block",
    //     state: topState,
    //     children: [
    //       {
    //         type: "inline",
    //         state: { textModifiers: { italics: true } },
    //         children: [],
    //       },
    //     ],
    //     data: "1",
    //   },
    //   {
    //     type: "block",
    //     children: [],
    //     state: { textModifiers: { bold: true, italics: true } },
    //   },
    // ]);

    const topState = { textModifiers: { bold: true } };
    const node: Node = {
      data: {
        type: "block",
        data: "1",
      },
      state: topState,
      children: [
        {
          data: {
            type: "inline",
          },
          children: [
            {
              data: {
                type: "block",
              },
              state: { textModifiers: { italics: true } },
              children: [],
            },
          ],
        },
      ],
    };
    const result = extractToTopLevel(node, isBlock);
    expect(result).toEqual([
      {
        ...node,
        children: [
          {
            data: {
              type: "inline",
            },
            children: [],
          },
        ],
      },
      {
        data: {
          type: "block",
        },
        children: [],
        state: { textModifiers: { bold: true, italics: true } },
      },
    ]);
    const node2: Node = {
      data: {
        type: "block",
        data: "1",
      },
      state: topState,
      children: [
        {
          data: {
            type: "inline",
          },
          state: { textModifiers: { italics: true } },
          children: [
            {
              data: {
                type: "block",
              },
              children: [],
            },
          ],
        },
      ],
    };
    const result2 = extractToTopLevel(node2, isBlock);
    expect(result2).toEqual([
      {
        ...node2,
        children: [
          {
            state: { textModifiers: { italics: true } },
            data: {
              type: "inline",
            },
            children: [],
          },
        ],
      },
      {
        data: {
          type: "block",
        },
        children: [],
        state: { textModifiers: { bold: true, italics: true } },
      },
    ]);
  });

  it("should override state based on the deepest nested node", () => {
    // const topState = { textModifiers: { bold: true } };
    // const node = {
    //   type: "block",
    //   state: topState,
    //   children: [
    //     {
    //       type: "inline",
    //       children: [
    //         {
    //           type: "block",
    //           state: { textModifiers: { bold: false } },
    //           children: [],
    //         },
    //       ],
    //     },
    //   ],
    //   data: "1",
    // } as const satisfies Node;
    //
    // const result = flattenBlocksTree(node);
    //
    // expect(result).toEqual([
    //   {
    //     type: "block",
    //     children: [
    //       {
    //         type: "inline",
    //         children: [],
    //       },
    //     ],
    //     data: "1",
    //     state: topState,
    //   },
    //   {
    //     type: "block",
    //     children: [],
    //     state: { textModifiers: { bold: false } },
    //   },
    // ]);
    //
    // const node2 = {
    //   type: "block",
    //   state: topState,
    //   children: [
    //     {
    //       type: "inline",
    //       state: { textModifiers: { bold: false } },
    //       children: [
    //         {
    //           type: "block",
    //           children: [],
    //         },
    //       ],
    //     },
    //   ],
    //   data: "1",
    // } as const satisfies Node;
    //
    // const result2 = flattenBlocksTree(node2);
    //
    // expect(result2).toEqual([
    //   {
    //     type: "block",
    //     state: topState,
    //     children: [
    //       {
    //         type: "inline",
    //         state: { textModifiers: { bold: false } },
    //         children: [],
    //       },
    //     ],
    //     data: "1",
    //   },
    //   {
    //     type: "block",
    //     children: [],
    //     state: { textModifiers: { bold: false } },
    //   },
    // ]);

    const topState = { textModifiers: { bold: true } };
    const node: Node = {
      data: {
        type: "block",
        data: "1",
      },
      state: topState,
      children: [
        {
          data: {
            type: "inline",
          },
          children: [
            {
              data: {
                type: "block",
              },
              state: { textModifiers: { bold: false } },
              children: [],
            },
          ],
        },
      ],
    };
    const result = extractToTopLevel(node, isBlock);
    expect(result).toEqual([
      {
        ...node,
        children: [
          {
            data: {
              type: "inline",
            },
            children: [],
          },
        ],
      },
      {
        data: {
          type: "block",
        },
        children: [],
        state: { textModifiers: { bold: false } },
      },
    ]);
    const node2: Node = {
      data: {
        type: "block",
        data: "1",
      },
      state: topState,
      children: [
        {
          data: {
            type: "inline",
          },
          state: { textModifiers: { bold: false } },
          children: [
            {
              data: {
                type: "block",
              },
              children: [],
            },
          ],
        },
      ],
    };
    const result2 = extractToTopLevel(node2, isBlock);
    expect(result2).toEqual([
      {
        ...node2,
        children: [
          {
            data: {
              type: "inline",
            },
            state: { textModifiers: { bold: false } },
            children: [],
          },
        ],
      },
      {
        data: {
          type: "block",
        },
        children: [],
        state: { textModifiers: { bold: false } },
      },
    ]);
  });
});
