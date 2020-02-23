// @ts-nocheck
import * as actionTypes from "./actionTypes";

const initialState = {
  branch: [],
  relationGraph: null,
  selectedPath: "",
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
    default:
      // throw new Error("Invalid action");
      return state;
  }
};
