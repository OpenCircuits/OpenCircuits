import React from "react";
import ReactDOM from "react-dom";

import {createStore, applyMiddleware} from "redux";
import thunk from "redux-thunk";
import {Provider} from "react-redux";

import {reducers} from "./site/state/reducers";

import {App} from "./site/containers/App";

import {Images} from "digital/utils/Images";
import "digital/models/ioobjects";


async function Init(): Promise<void> {
    // Load images
    await Images.Load();

    const store = createStore(reducers, applyMiddleware(thunk));

    ReactDOM.render(
        <React.StrictMode>
            <Provider store={store}>
                <App />
            </Provider>
        </React.StrictMode>,
        document.getElementById("root")
    );

    // Hide loading screen
    document.getElementById("loading-screen").style.display = "none";
}

Init();
