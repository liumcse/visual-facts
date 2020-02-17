// @ts-nocheck

import { createStore, compose } from "redux";
import rootReducer from "./reducers";

const composeEnhancers =
  (window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

const store = createStore(rootReducer, composeEnhancers);

export default store;
