import React from "react";
import {createRoot} from "react-dom/client";

import {App} from "./App";


async function Init(): Promise<void> {
    // TODO: Try removing setTimeout when React Compiler is more stable
    setTimeout(() => {
        const root = createRoot(document.getElementById("root")!);
        root.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
    });
}

Init();
