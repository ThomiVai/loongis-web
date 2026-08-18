import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

import { CartProvider } from "./context/CartProvider";
import { NotificationProvider } from "./context/NotificationProvider";

import "./styles/global.css";
import "./styles/Mobile.css";

createRoot(
  document.getElementById("root")!,
).render(
  <StrictMode>
    <BrowserRouter>
      <NotificationProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </NotificationProvider>
    </BrowserRouter>
  </StrictMode>,
);