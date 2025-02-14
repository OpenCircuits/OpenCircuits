import React                          from "react";
import ReactDOM                       from "react-dom";
import ReactGA                        from "react-ga";
import {Provider}                     from "react-redux";
import {applyMiddleware, createStore} from "redux";
import thunk, {ThunkMiddleware}       from "redux-thunk";

import {DEV_CACHED_CIRCUIT_FILE} from "shared/site/utils/Constants";

import {Images} from "shared/api/circuit/utils/Images";

import {DefaultTool}      from "shared/api/circuit/tools/DefaultTool";
import {PanTool}          from "shared/api/circuit/tools/PanTool";
import {RotateTool}       from "shared/api/circuit/tools/RotateTool";
import {SelectionBoxTool} from "shared/api/circuit/tools/SelectionBoxTool";
import {SplitWireTool}    from "shared/api/circuit/tools/SplitWireTool";
import {TranslateTool}    from "shared/api/circuit/tools/TranslateTool";
import {WiringTool}       from "shared/api/circuit/tools/WiringTool";

import {CleanUpHandler}       from "shared/api/circuit/tools/handlers/CleanUpHandler";
import {CopyHandler}          from "shared/api/circuit/tools/handlers/CopyHandler";
import {DeleteHandler}        from "shared/api/circuit/tools/handlers/DeleteHandler";
import {DeselectAllHandler}   from "shared/api/circuit/tools/handlers/DeselectAllHandler";
import {DuplicateHandler}     from "shared/api/circuit/tools/handlers/DuplicateHandler";
import {FitToScreenHandler}   from "shared/api/circuit/tools/handlers/FitToScreenHandler";
import {PasteHandler}         from "shared/api/circuit/tools/handlers/PasteHandler";
import {RedoHandler}          from "shared/api/circuit/tools/handlers/RedoHandler";
import {SaveHandler}          from "shared/api/circuit/tools/handlers/SaveHandler";
import {SelectAllHandler}     from "shared/api/circuit/tools/handlers/SelectAllHandler";
import {SelectionHandler}     from "shared/api/circuit/tools/handlers/SelectionHandler";
import {SelectPathHandler}    from "shared/api/circuit/tools/handlers/SelectPathHandler";
import {SnipWirePortsHandler} from "shared/api/circuit/tools/handlers/SnipWirePortsHandler";
import {UndoHandler}          from "shared/api/circuit/tools/handlers/UndoHandler";

import {ResizeTool} from "analog/tools/ResizeTool";

import {CursorHandler} from "analog/tools/handlers/CursorHandler";

import {NGSpiceLib} from "analog/models/sim/lib/NGSpiceLib";

import {GetCookie}     from "shared/site/utils/Cookies";
import {LoadingScreen} from "shared/site/utils/LoadingScreen";

import {DevGetFile, DevListFiles} from "shared/api/Dev";

import {NoAuthState} from "shared/api/auth/NoAuthState";

import {SetCircuitSaved} from "shared/site/state/CircuitInfo";

import {Login} from "shared/site/state/thunks/User";

import {App}                from "./containers/App";
import NGSpice              from "./lib/ngspice.wasm";
import {AppState, AppStore} from "./state";
import {AllActions}         from "./state/actions";
import {reducers}           from "./state/reducers";
import {AnalogPaste}        from "./utils/AnalogPaste";
import {Setup}              from "./utils/CircuitInfo/Setup";

import ImageFiles from "./data/images.json";


async function Init(): Promise<void> {
    const startPercent = 10;
    let store: AppStore;
    let ngSpiceLib: NGSpiceLib;

    await LoadingScreen("loading-screen", startPercent, [
        [40, "Loading Images", async (onProgress) => {
            await Images.Load(ImageFiles.images, onProgress);
        }],

        [80, "Loading NGSpice Library", async () => {
            ngSpiceLib = await NGSpice();
            if (!ngSpiceLib)
                throw new Error("Failed to load NGSpice WASM binary!");
            ngSpiceLib.OC_init();
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
                        throw new Error("No client_id/OAUTH2_ID specificed for google auth!");

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
                            throw new Error("Failed to load GAPI!");
                    }

                    await new Promise((resolve) => gapi.load("auth2", resolve));
                    await gapi.auth2.init({ "client_id": clientId }).then(async (_) => {}); // Have to explicitly call .then
                },
            };
            try {
                if ((process.env.OC_AUTH_TYPES ?? "").trim().length > 0)
                    await Promise.all(process.env.OC_AUTH_TYPES!.split(" ").map((a) => AuthMethods[a]()));
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
                console.error("Failed to connect with Google Analytics:", e);
            }
        }],
        [100, "Rendering", async () => {
            // Setup circuit and get the CircuitInfo and helpers
            const [info, helpers] = Setup(
                store, ngSpiceLib,
                new DefaultTool(
                    SelectAllHandler, FitToScreenHandler, DuplicateHandler,
                    DeleteHandler, SnipWirePortsHandler, DeselectAllHandler,
                    SelectionHandler, SelectPathHandler,
                    RedoHandler, UndoHandler, CleanUpHandler, CopyHandler, CursorHandler,
                    PasteHandler((data) => AnalogPaste(data, info, undefined)),
                    SaveHandler(() => store.getState().user.isLoggedIn && helpers.SaveCircuitRemote()),
                ),
                PanTool, RotateTool, ResizeTool,
                TranslateTool, WiringTool,
                SplitWireTool, SelectionBoxTool
            );

            info.history.addCallback(() => {
                store.dispatch(SetCircuitSaved(false));
            });

            if (process.env.NODE_ENV === "development") {
                // Load dev state
                const files = await DevListFiles();
                if (files.includes(DEV_CACHED_CIRCUIT_FILE))
                    await helpers.LoadCircuit(() => DevGetFile(DEV_CACHED_CIRCUIT_FILE));
            }

            ReactDOM.render(
                <React.StrictMode>
                    <Provider store={store}>
                        <App info={info} helpers={helpers} />
                    </Provider>
                </React.StrictMode>,
                document.getElementById("root")
            );
        }],
    ]);
}

Init();
