import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "@capacitor/app";
import FullLottoLab from "./FullLottoLab";
import "./android-base.css";
import "./styles.css";

// Offline UI-only preview; no lottery providers or data store are imported.
const root = document.getElementById("root");
if (!root) throw new Error("Missing application root");
createRoot(root).render(<React.StrictMode><FullLottoLab /></React.StrictMode>);

// Hardware Back closes the visible sheet first, then returns to the previous UI
// screen; it must not launch the old LottoLab shell.
void App.addListener("backButton",()=>window.dispatchEvent(new Event("lottolab-back")));
