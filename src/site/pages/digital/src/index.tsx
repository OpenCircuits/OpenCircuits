import React, {createRef} from "react";
import ReactDOM from "react-dom";
import ReactGA from "react-ga";

import {createStore, applyMiddleware} from "redux";
import thunk, {ThunkMiddleware} from "redux-thunk";
import {Provider} from "react-redux";

import {Images} from "digital/utils/Images";

import "digital/models/ioobjects";

import {InteractionTool}  from "core/tools/InteractionTool";
import {PanTool}          from "core/tools/PanTool";
import {RotateTool}       from "core/tools/RotateTool";
import {TranslateTool}    from "core/tools/TranslateTool";
import {WiringTool}       from "core/tools/WiringTool";
import {SplitWireTool}    from "core/tools/SplitWireTool";
import {SelectionBoxTool} from "core/tools/SelectionBoxTool";

import {SelectAllHandler}     from "core/tools/handlers/SelectAllHandler";
import {FitToScreenHandler}   from "core/tools/handlers/FitToScreenHandler";
import {DuplicateHandler}     from "core/tools/handlers/DuplicateHandler";
import {DeleteHandler}        from "core/tools/handlers/DeleteHandler";
import {SnipWirePortsHandler} from "core/tools/handlers/SnipWirePortsHandler";
import {DeselectAllHandler}   from "core/tools/handlers/DeselectAllHandler";
import {SelectionHandler}     from "core/tools/handlers/SelectionHandler";
import {SelectPathHandler}    from "core/tools/handlers/SelectPathHandler";
import {UndoHandler}          from "core/tools/handlers/UndoHandler";
import {RedoHandler}          from "core/tools/handlers/RedoHandler";
import {CopyHandler}          from "core/tools/handlers/CopyHandler";
import {PasteHandler}         from "core/tools/handlers/PasteHandler";
import {CleanUpHandler}       from "core/tools/handlers/CleanUpHandler";
import {SaveHandler}          from "core/tools/handlers/SaveHandler";

import {GetCookie}     from "shared/utils/Cookies";
import {LoadingScreen} from "shared/utils/LoadingScreen";

import {SetCircuitSaved} from "shared/state/CircuitInfo";

import {NoAuthState} from "shared/api/auth/NoAuthState";

import {Login} from "shared/state/thunks/User";

import {DigitalPaste} from "./utils/DigitalPaste";
import {Setup}        from "./utils/CircuitInfo/Setup";

import {AppState, AppStore} from "./state";
import {AllActions}         from "./state/actions";
import {reducers}           from "./state/reducers";

import {App} from "./containers/App";


async function Init(): Promise<void> {
    const startPercent = 30;
    let store: AppStore;

    await LoadingScreen("loading-screen", startPercent, [
        [80, "Loading Images", async (onProgress) => {
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

                    // Wait for GAPI to load
                    if (!gapi) {
                        const loaded = await new Promise<boolean>((resolve) => {
                            let numChecks = 0;
                            const interval = setInterval(() => {
                                // Check if GAPI loaded
                                if (gapi) {
                                    clearInterval(interval);
                                    resolve(true);
                                }
                                // Stop trying to load GAPI after 100 iterations
                                else if (numChecks > 100) {
                                    clearInterval(interval);
                                    resolve(false);
                                }
                                numChecks++;
                            }, 50); // Poll every 1/20th of a second
                        });

                        if (!loaded)
                            throw new Error(`Failed to load GAPI!`);
                    }

                    await new Promise((resolve) => gapi.load("auth2", resolve));
                    await gapi.auth2.init({ client_id: clientId }).then(async (_) => {}); // Have to explicitly call .then
                }
            };
            try {
                if ((process.env.OC_AUTH_TYPES ?? "").trim().length > 0)
                    await Promise.all(process.env.OC_AUTH_TYPES!.split(" ").map(a => AuthMethods[a]()));
            } catch (e) {
                console.error(e);
            }
        }],
        [99, "Google Analytics", async () => {
            try {
                if (!process.env.OC_GA_ID)
                    throw new Error("Can't find Google Analytics ID");
                ReactGA.initialize(process.env.OC_GA_ID, {});
                ReactGA.pageview("/");
            } catch (e) {
                console.error("Failed to connect with Google Analytics: ", e);
            }
        }],
        [100, "Rendering", async () => {
            // Setup
            const canvas = createRef<HTMLCanvasElement>();

            // Setup circuit and get the CircuitInfo and helpers
            const [info, helpers] = Setup(
                store, canvas,
                new InteractionTool([
                    SelectAllHandler, FitToScreenHandler, DuplicateHandler,
                    DeleteHandler, SnipWirePortsHandler, DeselectAllHandler,
                    SelectionHandler, SelectPathHandler, RedoHandler, UndoHandler,
                    CleanUpHandler, CopyHandler,
                    PasteHandler((data) => DigitalPaste(data, info, undefined)),
                    SaveHandler(() => store.getState().user.isLoggedIn && helpers.SaveCircuitRemote()),
                ]),
                PanTool, RotateTool,
                TranslateTool, WiringTool,
                SplitWireTool, SelectionBoxTool
            );

            info.history.addCallback(() => {
                store.dispatch(SetCircuitSaved(false));
            });

            ReactDOM.render(
                <React.StrictMode>
                    <Provider store={store}>
                        <App info={info} helpers={helpers} canvas={canvas} />
                    </Provider>
                </React.StrictMode>,
                document.getElementById("root")
            );
        }]
    ]);
}

Init();
