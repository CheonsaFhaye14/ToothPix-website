import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom"; 
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter 
      basename="/" 
      future={{ 
        v7_startTransition: true,       // Wrap state updates in startTransition
        v7_relativeSplatPath: true      // Enable new relative splat path behavior
      }}
    >
      {/* Use "/" for local development, "/Smart-Dental/" if hosted */}
      <App />
    </HashRouter>
  </StrictMode>
);

reportWebVitals();
