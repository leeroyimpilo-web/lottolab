import React from "react";
import { createRoot } from "react-dom/client";
import LottoLabPreview from "./LottoLabPreview";
import "./android-base.css";
import "./styles.css";

// Standalone Android UI demo. No Next.js legacy shell, auth, feeds, analytics,
// storage or external network dependencies are imported.
const root = document.getElementById("root");
if (!root) throw new Error("Missing application root");
createRoot(root).render(<React.StrictMode><LottoLabPreview /></React.StrictMode>);
