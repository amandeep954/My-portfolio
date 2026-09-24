import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
// Apply saved or preferred theme immediately to avoid flash and ensure
// `html.light` is present before React mounts.
try {
  const saved = localStorage.getItem("theme");
  if (saved === "light") {
    document.documentElement.classList.add("light");
    if (document.body) document.body.classList.add("light");
  } else if (
    !saved &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches
  ) {
    document.documentElement.classList.add("light");
    if (document.body) document.body.classList.add("light");
  } else {
    document.documentElement.classList.remove("light");
    if (document.body) document.body.classList.remove("light");
  }
} catch (e) {}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
