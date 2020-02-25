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
  selectedPath?: string;
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
    function entityTypeToColor(entityType: EntityType | null | undefined) {
      switch (entityType) {
        case EntityType.CLASS:
          return "blue";
        case EntityType.FUNCTION:
          return "green";
        default:
          return "red";
      }
    }

    return (
      <span
        className={styles.tab}
        onClick={() => {
          if (!node.entityType) {
            alert("Invalid path. Path must lead to an entity!");
            return;
          }
          const selectedPath = node.path.slice(1);
          handleClick(selectedPath);
        }}
      >
        {node.label}{" "}
        {node.entityType ? (
          <span style={{ color: entityTypeToColor(node.entityType) }}>
            {"<" + node.entityType + ">"}
          </span>
        ) : (
          ""
        )}
      </span>
    );
  }

  const { relationGraph } = props;
  if (!relationGraph) {
    return <div style={{ padding: " 0 1rem 1rem 1rem" }}>Initializing</div>;
  }
  const trie = relationGraph.getTrie();
  const pathTreeNode = convertTrieToPathTreeNode(trie);
  return (
    <div className={styles.container}>
      <div className={styles.pathDisplay}>
        <div className={styles.label}>FILTER APPLIED</div>
        <div className={styles.content}>
          {props.selectedPath ||
            "None (all facts are included in visualization)"}
        </div>
      </div>
      <div className={styles.noSelect}>
        <TreeUI
          paddingLeft={10}
          tree={pathTreeNode}
          renderNode={Tab}
          draggable={false}
        />
      </div>
    </div>
  );
}

function mapStateToProps(state: any) {
  return {
    selectedPath: state.selectedPath,
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
