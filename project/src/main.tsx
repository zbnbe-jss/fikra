import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// The deployed site is served at a URL ending in "/#/", which is the
// signature of react-router's HashRouter (needed on static hosts like
// bolt.host that don't rewrite unknown paths to index.html for every route).
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
