import React from "react";
import ReactDOM from "react-dom";

import {createStore, applyMiddleware} from "redux";
import thunk, {ThunkMiddleware} from "redux-thunk";
import {Provider} from "react-redux";

import {Images} from "digital/utils/Images";

import "digital/models/ioobjects";

import {GetCookie} from "shared/utils/Cookies";
import {LoadingScreen} from "shared/utils/LoadingScreen";

import {NoAuthState} from "shared/api/auth/NoAuthState";

import {Login} from "shared/state/thunks/User";

import {AppState, AppStore} from "./state";
import {AllActions} from "./state/actions";
import {reducers} from "./state/reducers";

import {App} from "./containers/App";


async function setPercent(percentDone: number) {
    document.getElementById("loading-screen-progress-bar").style.width = percentDone + "%";
}

function progressError(error: any, text: string) {
    document.getElementById("loading-screen-progress-bar").style.width = "100%";
    document.getElementById("loading-screen-progress-bar").style.backgroundColor = "#f44336";
    const message = "<a href=\"https://github.com/OpenCircuits/OpenCircuits/issues/new/choose\">" + text + " Please refresh the page. If this error continues to occur, please click this text to submit a bug report.</a>";
    document.getElementById("loading-screen-text").innerHTML = message;
    console.error(error);
}

async function Init(): Promise<void> {
    const startPercent = 30;
    const imageLoadPercent = 80;
    let store: AppStore;

    await LoadingScreen("loading-screen", startPercent, [
        [imageLoadPercent, "Loading Images", async () => {
            try {
                await Images.Load(setPercent, startPercent, imageLoadPercent);
            } catch (e) {
                progressError(e, "Error occurred while loading images.");
            }
        }],
        [85, "Initializing redux", async () => {
            try {
                store = createStore(reducers, applyMiddleware(thunk as ThunkMiddleware<AppState, AllActions>));
            } catch (e) {
                progressError(e, "Error occurred while initializing redux.");
            }
        }],
        [95, "Initializing Authentication", async () => {
            let AuthMethods: Record<string, () => Promise<void>>
            try {
                AuthMethods = {
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
            } catch (e) {
                progressError(e, "Error occurred while initializing authentication.");
            }
            try {
                if ((process.env.OC_AUTH_TYPES ?? "").trim().length > 0)
                    await Promise.all(process.env.OC_AUTH_TYPES.split(" ").map(a => AuthMethods[a]()));
            } catch (e) {
                console.error(e);
            }
        }],
        [100, "Rendering", async () => {
            try {
                const AppView = App(store);
                ReactDOM.render(
                    <React.StrictMode>
                        <Provider store={store}>
                            {AppView()}
                        </Provider>
                    </React.StrictMode>,
                    document.getElementById("root")
                );
            } catch (e) {
                progressError(e, "Error occurred while rendering.");
            }
        }]
    ]);
}

Init();
