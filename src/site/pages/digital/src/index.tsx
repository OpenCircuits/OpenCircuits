import React from "react";
import ReactDOM from "react-dom";

import {createStore, applyMiddleware} from "redux";
import thunk, {ThunkMiddleware} from "redux-thunk";
import {Provider} from "react-redux";

import {Images} from "digital/utils/Images";

import "digital/models/ioobjects";

import {GetCookie} from "shared/utils/Cookies";

import {NoAuthState} from "shared/api/auth/NoAuthState";

import {Login} from "shared/state/thunks/User";

import {AppState, AppStore} from "./state";
import {AllActions} from "./state/actions";
import {reducers} from "./state/reducers";

import {App} from "./containers/App";


async function Init(): Promise<void> {
    // Load images
    document.getElementById("loading-screen-progress-bar").style.width = "20%";
    document.getElementById("loading-screen-text").innerHTML = "Loading Images...";
    await Images.Load();

    document.getElementById("loading-screen-progress-bar").style.width = "40%";
    document.getElementById("loading-screen-text").innerHTML = "Creating Store...";
    const store: AppStore = createStore(reducers, applyMiddleware(thunk as ThunkMiddleware<AppState, AllActions>));

    // Initialize auth
    document.getElementById("loading-screen-progress-bar").style.width = "60%";
    document.getElementById("loading-screen-text").innerHTML = "Loading Authentication...";
    const AuthMethods: Record<string, () => Promise<void>> = {
        "no_auth": async () => {
            const username = GetCookie("no_auth_username");
            if (username)
                await store.dispatch(Login(new NoAuthState(username)));
        },
        "google": async () => {
            // Load auth2 from GAPI and initialize w/ metadata
            const clientId = process.env.OC_OAUTH2_ID;
            if (!clientId)
                throw new Error(`No client_id/OAUTH2_ID specificed for google auth!`);
            await new Promise((resolve) => gapi.load("auth2", resolve));
            await gapi.auth2.init({ client_id: clientId }).then(async (_) => {}); // Have to explicitly call .then
        }
    };
    try {
        if ((process.env.OC_AUTH_TYPES ?? "").trim().length > 0)
            await Promise.all(process.env.OC_AUTH_TYPES.split(" ").map(a => AuthMethods[a]()));
    } catch (e) {
        console.error(e);
    }


    document.getElementById("loading-screen-progress-bar").style.width = "80%";
    document.getElementById("loading-screen-text").innerHTML = "Rendering...";
    const AppView = App(store);
    ReactDOM.render(
        <React.StrictMode>
            <Provider store={store}>
                {AppView()}
            </Provider>
        </React.StrictMode>,
        document.getElementById("root")
    );

    document.getElementById("loading-screen-progress-bar").style.width = "100%";
    document.getElementById("loading-screen-text").innerHTML = "Done!";

    // Hide loading screen
    document.getElementById("loading-screen").style.display = "none";
}

Init();
