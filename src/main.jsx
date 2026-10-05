import React from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./AuthContext.jsx";
import App from "./App.jsx";
import PublicPix from "./screens/PublicPix.jsx";
import "./styles.css";

const path = window.location.pathname.replace(/\/$/, "") || "/";
const match = path.match(/^\/p\/([^/]+)$/);

createRoot(document.getElementById("root")).render(
  match ? (
    <PublicPix id={decodeURIComponent(match[1])} />
  ) : (
    <AuthProvider>
      <App />
    </AuthProvider>
  )
);