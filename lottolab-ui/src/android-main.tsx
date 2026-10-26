import React from "react";
import { createRoot } from "react-dom/client";
import FullLottoLab from "./FullLottoLab";
import "./android-base.css";
import "./styles.css";

// Offline, isolated UI preview. No production lottery providers or storage.
const root = document.getElementById("root");
if (!root) throw new Error("Missing application root");
createRoot(root).render(<React.StrictMode><FullLottoLab /></React.StrictMode>);
