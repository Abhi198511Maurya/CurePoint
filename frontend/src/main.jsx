import React from 'react';
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";

React.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
