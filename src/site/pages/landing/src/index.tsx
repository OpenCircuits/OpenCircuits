import React    from "react";
import ReactDOM from "react-dom";

import {App} from "./App";


async function Init(): Promise<void> {
    ReactDOM.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
        document.getElementById("root")
    );
}

Init();
