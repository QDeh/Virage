import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "./store";
import App from "./App";
import { AccountGate } from "./account";
import "./styles.css";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AccountGate>
      <Provider>
        <App />
      </Provider>
    </AccountGate>
  </React.StrictMode>,
);
