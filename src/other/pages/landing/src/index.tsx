import React from "react";
import {createRoot} from "react-dom/client";

import {App} from "./App";


async function Init(): Promise<void> {
    const root = createRoot(document.getElementById("root")!);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}

Init();
