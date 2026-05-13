import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "@fontsource/sen/400.css";
import "@fontsource/sen/500.css";
import "@fontsource/sen/600.css";
import "@fontsource/sen/700.css";

import "antd/dist/antd.min.css";
import "./global.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
