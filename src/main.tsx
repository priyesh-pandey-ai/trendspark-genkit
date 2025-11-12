import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Import test utilities (only in development)
if (import.meta.env.DEV) {
  import('./lib/testReddit');
}

createRoot(document.getElementById("root")!).render(<App />);
