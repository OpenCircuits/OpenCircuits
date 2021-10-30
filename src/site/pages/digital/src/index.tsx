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


async function Init(): Promise<void> {
    const startPercent = 30;
    const imageLoadPercent = 80;
    let store: AppStore;

    await LoadingScreen("loading-screen", startPercent, [
        [imageLoadPercent, "Loading Images", async (onProgress) => {
            await Images.Load(onProgress);
        }],
        [85, "Initializing redux", async () => {
            store = createStore(reducers, applyMiddleware(thunk as ThunkMiddleware<AppState, AllActions>));
        }],
        [95, "Initializing Authentication", async () => {
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
        }],
        [100, "Rendering", async () => {
            const AppView = App(store);
            ReactDOM.render(
                <React.StrictMode>
                    <Provider store={store}>
                        {AppView()}
                    </Provider>
                </React.StrictMode>,
                document.getElementById("root")
            );
        }]
    ]);
}

Init();
