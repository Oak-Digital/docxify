import type { IRunOptions } from "docx";
import { merge } from "lodash";

export type State = {
  readonly textModifiers?: IRunOptions;
};

export type Node<Data = string> = {
  readonly type: "block" | "inline";
  // State should cascade to children
  readonly state?: State;
  readonly children: Node<Data>[];
  readonly data?: Data;
};

/**
 * extracts blocks to the top level
 */
export const flattenBlocksTree = <T>(
  node: Node<T>,
  state?: State,
): Node<T>[] => {
  const children = node.children;
  const isLeaf = children.length === 0;

  if (isLeaf) {
    return [node];
  }

  const currentState =
    node.state || state ? merge({}, state, node.state) : undefined;

  const flattenedChildren = children.flatMap((child) => {
    const cascadedState =
      currentState || child.state
        ? merge({}, currentState, child.state)
        : undefined;
    const flattened = flattenBlocksTree<T>(child, cascadedState);

    return flattened;
  });

  const topLevel: Node<T>[] = [];

  const createCurrent = (node: Node<T>): Node<T> => {
    return {
      ...node,
      children: [],
    };
  };
  let current: Node<T> = createCurrent(node);
  topLevel.push(current);

  flattenedChildren.forEach((child, i) => {
    if (child.type === "block") {
      const cascadedState =
        currentState || child.state
          ? merge({}, currentState, child.state)
          : undefined;
      topLevel.push({
        ...child,
        state: cascadedState,
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
