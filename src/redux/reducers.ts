// @ts-nocheck
import * as actionTypes from "./actionTypes";

export default (state, action) => {
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
    default:
      // throw new Error("Invalid action");
      return state;
  }
};
