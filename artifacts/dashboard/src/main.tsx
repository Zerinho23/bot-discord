import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Fix: El overlay de Vite HMR llama a removeChild/insertBefore en nodos que
// no son hijos del padre, lanzando excepciones que bloquean la pantalla.
// Este parche los ignora silenciosamente.
const _origRemoveChild = Node.prototype.removeChild;
Node.prototype.removeChild = function <T extends Node>(child: T): T {
  if (child.parentNode !== this) return child;
  return _origRemoveChild.call(this, child) as T;
};

const _origInsertBefore = Node.prototype.insertBefore;
Node.prototype.insertBefore = function <T extends Node>(
  newNode: T,
  referenceNode: Node | null
): T {
  if (referenceNode && referenceNode.parentNode !== this) return newNode;
  return _origInsertBefore.call(this, newNode, referenceNode) as T;
};

createRoot(document.getElementById("root")!).render(<App />);
