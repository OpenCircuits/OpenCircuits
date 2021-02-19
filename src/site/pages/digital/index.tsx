import React from "react";
import ReactDOM from "react-dom";

import {createStore, applyMiddleware} from "redux";
import thunk, {ThunkMiddleware} from "redux-thunk";
import {Provider} from "react-redux";

import {Images} from "digital/utils/Images";

import "digital/models/ioobjects";

import {GetCookie} from "shared/utils/Cookies";
import {NoAuthState} from "shared/api/auth/NoAuthState";
import {Login} from "shared/state/UserInfo/actions";

import {reducers} from "./state/reducers";

import {App} from "./containers/App";
import {AppState, AppStore} from "./state";
import {AllActions} from "./state/actions";


async function Init(): Promise<void> {
    // Load images
    await Images.Load();

    const store: AppStore = createStore(reducers, applyMiddleware(thunk as ThunkMiddleware<AppState, AllActions>));

    // Initialize auth
    const AuthMethods: Record<string, () => Promise<void>> = {
        "no_auth": async () => {
            const username = GetCookie("no_auth_username");
            if (username)
                await store.dispatch<any>(Login(new NoAuthState(username)));
        },
        "google": async () => {
        }
    };
    await Promise.all((process.env.REACT_APP_AUTH_TYPES ?? "").split(" ").map(a => AuthMethods[a]()));

    const AppView = App(store);
    ReactDOM.render(
        <React.StrictMode>
            <Provider store={store}>
                <AppView />
            </Provider>
        </React.StrictMode>,
        document.getElementById("root")
    );

    // Hide loading screen
    document.getElementById("loading-screen").style.display = "none";
}

Init();
