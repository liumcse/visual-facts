import * as React from "react";
import TreeUI from "react-ui-tree";
import { connect } from "react-redux";
import {
  RelationGraph,
  EntityTrie,
  EntityType,
} from "@root/libs/dataStructures";
import { updateSelectedPath } from "@root/redux/actions";
import * as styles from "./style.scss";

type Props = {
  data?: object;
  relationGraph: RelationGraph;
  updateSelectedPath: Function;
};

type TreeNode = {
  label: string;
  path: string;
  isEntity?: boolean;
  entityType?: EntityType | null;
  children: TreeNode[];
};

function convertTrieToPathTreeNode(trie: EntityTrie) {
  const root = {
    label: "",
    path: "",
    isEntity: false,
    entityType: null,
    children: [],
  };

  function helper(node: TreeNode) {
    const prefix = node.path;
    const entities = trie.listEntitiesUnderPrefix(prefix);
    for (const entity of entities) {
      const newTreeNode = {
        label: entity.name,
        path: node.path + "." + entity.name,
        isEntity: !!entity.entityType,
        entityType: entity.entityType,
        children: [],
      };
      helper(newTreeNode);
      node.children.push(newTreeNode);
    }
    return node;
  }

  return helper(root);
}

function PathTree(props: Props) {
  function handleClick(selectedPath: string) {
    props.updateSelectedPath(selectedPath);
    console.log("updated to", selectedPath);
  }

  function Tab(node: TreeNode) {
    return (
      <span
        className={styles.tab}
        onClick={() => {
          if (!node.entityType) {
            console.log("Invalid path. Must at least be an entity!");
            return;
          }
          const selectedPath = node.path.slice(1);
          handleClick(selectedPath);
        }}
      >
        {`${node.label} ${node.entityType ? "<" + node.entityType + ">" : ""}`}
      </span>
    );
  }

  const { relationGraph } = props;
  if (!relationGraph) {
    return <div>Initializing</div>;
  }
  const trie = relationGraph.getTrie();
  const pathTreeNode = convertTrieToPathTreeNode(trie);
  console.log({ pathTreeNode });
  return (
    <div className={styles.noSelect}>
      <TreeUI
        paddingLeft={10}
        tree={pathTreeNode}
        renderNode={Tab}
        draggable={false}
      />
    </div>
  );
}

function mapStateToProps(state: any) {
  return {
    relationGraph: state.relationGraph,
  };
}

function mapDispatchToProps(dispatch: Function) {
  return {
    updateSelectedPath: (selectedPath: string) =>
      dispatch(updateSelectedPath(selectedPath)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PathTree);
