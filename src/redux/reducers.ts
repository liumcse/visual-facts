// @ts-nocheck
import * as actionTypes from "./actionTypes";

const initialState = {
  branch: [],
  relationGraph: null,
  selectedPath: "",
  showDiff: false,
  diff: null,
  entityTypeFilter: {
    class: true,
    function: true,
    variable: true,
  },
};

export default (state = initialState, action) => {
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
    default:
      // throw new Error("Invalid action");
      return state;
  }
};
