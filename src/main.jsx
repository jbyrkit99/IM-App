import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles.css";
import { AuthProvider } from "./contexts/AuthProvider.jsx";
import { RoomsProvider } from "./contexts/RoomsProvider.jsx";
import { MessagesProvider } from "./contexts/MessagesProvider.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <RoomsProvider>
          <MessagesProvider>
            <App />
          </MessagesProvider>
        </RoomsProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
