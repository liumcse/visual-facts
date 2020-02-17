import * as actionTypes from "./actionTypes";
import { RelationGraph } from "@root/libs/dataStructures";

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
