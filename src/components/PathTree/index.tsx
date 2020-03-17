import * as React from "react";
import TreeUI from "react-ui-tree";
import { connect } from "react-redux";
import {
  RelationGraph,
  EntityTrie,
  EntityType,
} from "@root/libs/dataStructures";
import {
  updateSelectedPath,
  updateHighlightedEntityId,
} from "@root/redux/actions";
import * as styles from "./style.scss";
import { cx } from "@root/utils";

type Props = {
  data?: object;
  selectedPath?: string;
  relationGraph: RelationGraph;
  updateSelectedPath: Function;
  updateHighlightedEntityId: Function;
  showDiff: boolean;
};

type TreeNode = {
  label: string;
  path: string;
  isEntity?: boolean;
  entityType?: EntityType | null;
  children: TreeNode[];
  flags: {
    inserted?: boolean;
    deleted?: boolean;
    updated?: boolean;
  };
};

function convertTrieToPathTreeNode(trie: EntityTrie, ignoreDiff: boolean) {
  const root = {
    label: "",
    path: "",
    isEntity: false,
    entityType: null,
    children: [],
    flags: {},
  };

  function helper(node: TreeNode) {
    const prefix = node.path;
    const entities = trie.listEntitiesUnderPrefix(prefix);
    for (const entity of entities) {
      if (ignoreDiff && entity.flags.deleted) {
        // if ignore diff, deleted entities will not be added
        continue;
      }
      const newTreeNode = {
        label: entity.name,
        path: node.path + "." + entity.name,
        isEntity: !!entity.entityType,
        entityType: entity.entityType,
        children: [],
        flags: entity.flags,
      };
      helper(newTreeNode);
      node.children.push(newTreeNode);
    }
    return node;
  }
  return helper(root);
}

function PathTree(props: Props) {
  // TODO: Can we refactor Tab out of PathTree?
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

    function mapFlagToClassName(flags: {
      inserted?: boolean;
      deleted?: boolean;
      updated?: boolean;
    }) {
      if (flags.inserted) return "flagInserted";
      if (flags.deleted) return "flagDeleted";
      return "";
    }

    if (!node.label) return;

    return (
      <div
        className={cx(
          styles.tab,
          styles[(showDiff && mapFlagToClassName(node.flags)) || ""],
        )}
        onMouseEnter={() => handleMouseEnterTab(node)}
        onMouseLeave={() => handleMouseLeaveTab()}
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
      </div>
    );
  }

  function handleMouseLeaveTab() {
    props.updateHighlightedEntityId("");
  }

  function handleMouseEnterTab(node: TreeNode) {
    if (!node.entityType) return;
    const entityName = node.path.slice(1);
    props.updateHighlightedEntityId(entityName);
  }

  function handleClick(selectedPath: string) {
    props.updateSelectedPath(selectedPath);
  }

  const { relationGraph, showDiff } = props;
  if (!relationGraph) {
    return <div style={{ padding: " 0 1rem 1rem 1rem" }}>Initializing</div>;
  }
  const trie = relationGraph.getTrie();
  const pathTreeNode = convertTrieToPathTreeNode(trie, !showDiff);
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
        <TreeUI paddingLeft={10} tree={pathTreeNode} renderNode={Tab} />
      </div>
    </div>
  );
}

function mapStateToProps(state: any) {
  return {
    selectedPath: state.selectedPath,
    relationGraph: state.relationGraph,
    diff: state.diff,
    showDiff: state.showDiff,
  };
}

function mapDispatchToProps(dispatch: Function) {
  return {
    updateSelectedPath: (selectedPath: string) =>
      dispatch(updateSelectedPath(selectedPath)),
    updateHighlightedEntityId: (entityId: string) =>
      dispatch(updateHighlightedEntityId(entityId)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PathTree);
