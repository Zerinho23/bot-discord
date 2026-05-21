import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Fix: Vite HMR overlay tries to removeChild on a node that's not attached.
// This patch silently ignores that case instead of throwing.
const _origRemoveChild = Node.prototype.removeChild;
Node.prototype.removeChild = function <T extends Node>(child: T): T {
  if (child.parentNode !== this) {
    return child;
  }
  return _origRemoveChild.call(this, child) as T;
};

createRoot(document.getElementById("root")!).render(<App />);
