// @ts-nocheck
import * as actionTypes from "./actionTypes";
import { RelationGraph, Diff } from "@root/libs/dataStructures";

export type ReduxState = {
  branch: string[];
  relationGraph?: RelationGraph;
  selectedPath: string;
  highlightedEntityId: string;
  showDiff: boolean;
  diff?: Diff;
  entityTypeFilter: {
    class: boolean;
    function: boolean;
    variable: boolean;
  };
};

const initialState: ReduxState = {
  branch: [],
  relationGraph: null,
  selectedPath: "",
  highlightedEntityId: "",
  showDiff: false,
  diff: null,
  entityTypeFilter: {
    class: true,
    function: true,
    variable: true,
  },
};

export default (
  state = initialState,
  action: { type: string; payload: any },
): ReduxState => {
  const { type, payload } = action;
  switch (type) {
    case actionTypes.SWITCH_BRANCH:
      return {
        ...state,
        branch: payload,
      };
    case actionTypes.UPDATE_RELATION_GRAPH:
      return {
        ...state,
        relationGraph: payload,
      };
    case actionTypes.UPDATE_SELECTED_PATH:
      return {
        ...state,
        selectedPath: payload,
      };
    case actionTypes.UPDATE_ENTITY_TYPE_FILTER:
      return {
        ...state,
        entityTypeFilter: {
          ...state.entityTypeFilter,
          [payload]: !state.entityTypeFilter[payload],
        },
      };
    case actionTypes.TOGGLE_SHOW_DIFF:
      return {
        ...state,
        showDiff: payload,
      };
    case actionTypes.UPDATE_DIFF:
      return {
        ...state,
        diff: payload,
      };
    case actionTypes.UPDATE_HIGHLIGHTED_ENTITY_ID:
      return {
        ...state,
        highlightedEntityId: payload,
      };
    default:
      // throw new Error("Invalid action");
      return state;
  }
};
