import { merge } from "lodash";

export type StateDataTreeNode<Data = unknown, State = unknown> = {
  readonly state?: State;
  readonly children: StateDataTreeNode<Data, State>[];
  readonly data?: Data;
};

export const extractToTopLevel = <Data, State>(
  node: StateDataTreeNode<Data, State>,
  /**
   * When this function returns true, it means that the node should be extracted to the top level.
   */
  predicate: (
    node: StateDataTreeNode<Data, State>,
    child: StateDataTreeNode<Data, State>,
  ) => boolean,
  state?: State,
): StateDataTreeNode<Data, State>[] => {
  const children = node.children;
  const isLeaf = children.length === 0;

  if (isLeaf) {
    return [node];
  }

  const currentState =
    node.state || state ? merge({}, state, node.state) : undefined;

  const childrenExtracted = children.flatMap((child) => {
    const cascadedState =
      currentState || child.state
        ? merge({}, currentState, child.state)
        : undefined;
    const extracted = extractToTopLevel<Data, State>(
      child,
      predicate,
      cascadedState,
    );

    return extracted;
  });

  const topLevel: StateDataTreeNode<Data, State>[] = [];

  const createCurrent = (
    node: StateDataTreeNode<Data, State>,
  ): StateDataTreeNode<Data, State> => {
    const newCurrent = {
      ...node,
      children: [],
    };
    topLevel.push(newCurrent);
    return newCurrent;
  };

  let current: StateDataTreeNode<Data, State> = createCurrent(node);

  childrenExtracted.forEach((child, i) => {
    const shouldExtract = predicate(node, child);

    if (shouldExtract) {
      const cascadedState =
        currentState || child.state
          ? merge({}, currentState, child.state)
          : undefined;
      topLevel.push({
        ...child,
        state: cascadedState,
      });

      // if next is inline, create a new current
      const next = childrenExtracted[i + 1];
      const shouldNextExtract = next ? predicate(node, next) : false;

      if (next && !shouldNextExtract) {
        current = createCurrent(node);
      }
      return;
    }

    if (!shouldExtract) {
      current.children.push(child);
    }
  });

  return topLevel;
};
