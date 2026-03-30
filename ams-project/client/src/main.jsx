// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Wire authStore into axiosInstance BEFORE the app mounts
// so all interceptors can call store.logout() correctly.
import { setAuthStoreRef } from "./api/axiosInstance";
import useAuthStore from "./store/authStore";
setAuthStoreRef(() => useAuthStore.getState());

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
