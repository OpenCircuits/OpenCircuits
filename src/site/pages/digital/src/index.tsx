import {CreateCircuit, DigitalCircuit}                from "digital/public";
import React, {useLayoutEffect, useRef}                          from "react";
import ReactDOM                       from "react-dom";
import ReactGA                        from "react-ga";
import {Provider}                     from "react-redux";
import {applyMiddleware, createStore} from "redux";
import thunk, {ThunkMiddleware}       from "redux-thunk";

import {GetCookie}     from "shared/utils/Cookies";
import {Images}        from "shared/utils/Images";
import {LoadingScreen} from "shared/utils/LoadingScreen";

import {storeCircuit} from "shared/utils/hooks/useCircuit";

import {DevListFiles} from "shared/api/Dev";

import {NoAuthState} from "shared/api/auth/NoAuthState";

import {Login} from "shared/state/thunks/User";

import {App}                from "./containers/App";
import {AppState, AppStore} from "./state";
import {AllActions}         from "./state/actions";
import {reducers}           from "./state/reducers";

import ImageFiles from "./data/images.json";
import {useWindowSize} from "shared/utils/hooks/useWindowSize";


const MainCircuit = ({ circuit } : { circuit: DigitalCircuit }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { w, h } = useWindowSize();

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        return circuit.attachCanvas(canvas);
    }, [canvasRef]);

    useLayoutEffect(() => circuit.resize(w, h), [w, h]);

    return (
        <canvas 
            ref={canvasRef}
            width={w}
            height={h} />
    );
}

async function Init(): Promise<void> {
    const startPercent = 30;
    let store: AppStore;

    await LoadingScreen("loading-screen", startPercent, [
        [80, "Loading Images", async (onProgress) => {
            await Images.Load(ImageFiles.images, onProgress);
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
            // const [info, helpers] = Setup(
            //     store,
            //     new DefaultTool(
            //         SelectAllHandler, FitToScreenHandler, DuplicateHandler,
            //         DeleteHandler, SnipWirePortsHandler, DeselectAllHandler,
            //         PressableHandler, SelectionHandler, SelectPathHandler,
            //         RedoHandler, UndoHandler, CleanUpHandler, CopyHandler,
            //         PasteHandler((data) => DigitalPaste(data, info, undefined)),
            //         SaveHandler(() => store.getState().user.isLoggedIn && helpers.SaveCircuitRemote()),
            //     ),
            //     PanTool, RotateTool,
            //     TranslateTool, WiringTool,
            //     SelectionBoxTool, SplitWireTool
            // );

            // info.history.addCallback(() => {
            //     store.dispatch(SetCircuitSaved(false));
            // });
            const circuit = CreateCircuit();

            storeCircuit("main", circuit);

            // if (process.env.NODE_ENV === "development") {
            //     // Load dev state
            //     const files = await DevListFiles();
            //     // if (files.includes(DEV_CACHED_CIRCUIT_FILE))
            //     //     await circuit.LoadCircuit(() => DevGetFile(DEV_CACHED_CIRCUIT_FILE));
            // }

            ReactDOM.render(
                <React.StrictMode>
                    <MainCircuit circuit={circuit} />
                    {/* <Provider store={store}>
                        <App />
                    </Provider> */}
                </React.StrictMode>,
                document.getElementById("root")
            );
        }],
    ]);
}

Init();
