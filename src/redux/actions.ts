import * as actionTypes from "./actionTypes";
import { RelationGraph, Diff } from "@root/libs/dataStructures";

export function updateHighlightedEntityId(entityId: string) {
  return {
    type: actionTypes.UPDATE_HIGHLIGHTED_ENTITY_ID,
    payload: entityId,
  };
}

export function updateDiff(diff: Diff) {
  return {
    type: actionTypes.UPDATE_DIFF,
    payload: diff,
  };
}

export function toggleShowDiff(toggle: boolean) {
  return {
    type: actionTypes.TOGGLE_SHOW_DIFF,
    payload: toggle,
  };
}

export function switchBranch(branchName: string) {
  return {
    type: actionTypes.SWITCH_BRANCH,
    payload: branchName,
  };
}

export function updateRelationGraph(relationGraph: RelationGraph) {
  return {
    type: actionTypes.UPDATE_RELATION_GRAPH,
    payload: relationGraph,
  };
}

export function updateSelectedPath(selectedPath: string) {
  return {
    type: actionTypes.UPDATE_SELECTED_PATH,
    payload: selectedPath,
  };
}

export function updateEntityTypeFilter(
  entityTypeFilter: "class" | "variable" | "function",
) {
  return {
    type: actionTypes.UPDATE_ENTITY_TYPE_FILTER,
    payload: entityTypeFilter,
  };
}
