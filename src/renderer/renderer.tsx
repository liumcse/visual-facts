import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import store from "../redux/store";
import App from "../components/App";

function AppShell() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}

ReactDOM.render(<AppShell />, document.getElementById("app"));
