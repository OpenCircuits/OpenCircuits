import React, {useLayoutEffect, useRef} from "react";
import {createRoot}                     from "react-dom/client";
import ReactGA                          from "react-ga";
import {Provider}                       from "react-redux";
import {configureStore}                 from "@reduxjs/toolkit";

import {CreateCircuit} from "digital/public";

import {GetCookie}     from "shared/utils/Cookies";
import {LoadingScreen} from "shared/utils/LoadingScreen";

import {storeDesigner} from "shared/utils/hooks/useDesigner";

import {CreateDesigner} from "shared/circuitdesigner";

import {DefaultTool}      from "shared/tools/DefaultTool";
import {PanTool}          from "shared/tools/PanTool";
import {TranslateTool}    from "shared/tools/TranslateTool";
import {SelectionBoxTool} from "shared/tools/SelectionBoxTool";
import {RotateTool}       from "shared/tools/RotateTool";
import {WiringTool}       from "shared/tools/WiringTool";
import {SplitWireTool}    from "shared/tools/SplitWireTool";

import {CleanupHandler}     from "shared/tools/handlers/CleanupHandler";
import {CopyHandler}        from "shared/tools/handlers/CopyHandler";
import {DeleteHandler}      from "shared/tools/handlers/DeleteHandler";
import {DeselectAllHandler} from "shared/tools/handlers/DeselectAllHandler";
import {DuplicateHandler}   from "shared/tools/handlers/DuplicateHandler";
import {FitToScreenHandler} from "shared/tools/handlers/FitToScreenHandler";
import {PasteHandler}       from "shared/tools/handlers/PasteHandler";
import {RedoHandler}        from "shared/tools/handlers/RedoHandler";
import {SaveHandler}        from "shared/tools/handlers/SaveHandler";
import {SelectAllHandler}   from "shared/tools/handlers/SelectAllHandler";
import {SelectionHandler}   from "shared/tools/handlers/SelectionHandler";
import {SelectPathHandler}  from "shared/tools/handlers/SelectPathHandler";
import {SnipNodesHandler}   from "shared/tools/handlers/SnipNodesHandler";
import {UndoHandler}        from "shared/tools/handlers/UndoHandler";

import {SelectionBoxToolRenderer} from "shared/tools/renderers/SelectionBoxToolRenderer";
import {RotateToolRenderer}       from "shared/tools/renderers/RotateToolRenderer";

import {DigitalWiringToolRenderer} from "./tools/renderers/DigitalWiringToolRenderer";

import {DevListFiles} from "shared/api/Dev";

import {NoAuthState} from "shared/api/auth/NoAuthState";

import {Login} from "shared/state/thunks/User";

import {AppStore} from "./state";
import {reducers} from "./state/reducers";

import ImageFiles      from "./data/images.json";
import {useWindowSize} from "shared/utils/hooks/useWindowSize";

import {App} from "./containers/App";
import {DigitalCircuitDesigner} from "./utils/DigitalCircuitDesigner";


async function Init(): Promise<void> {
    const startPercent = 30;
    let store: AppStore;

    const designer = CreateDesigner(
        CreateCircuit(),
        {
            defaultTool: new DefaultTool(
                SelectAllHandler, FitToScreenHandler, DuplicateHandler,
                DeleteHandler, SnipNodesHandler, DeselectAllHandler,
                SelectionHandler, SelectPathHandler, RedoHandler, UndoHandler,
                CleanupHandler, CopyHandler, PasteHandler,
                SaveHandler(() => store.getState().user.isLoggedIn /* && helpers.SaveCircuitRemote() */)
            ),
            tools: [
                PanTool,
                new RotateTool(), new TranslateTool(),
                new WiringTool(), new SplitWireTool(),
                new SelectionBoxTool(),
            ],
            renderers: [RotateToolRenderer, new DigitalWiringToolRenderer(), SelectionBoxToolRenderer],
        },
    );

    await LoadingScreen("loading-screen", startPercent, [
        [80, "Loading Images", async (onProgress) => {
            await designer.circuit.loadImages(ImageFiles.images, onProgress);
        }],

        [85, "Initializing redux", async () => {
            store = configureStore({ reducer: reducers });
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
            // TODO[model_refactor](leon)
            // info.history.addCallback(() => {
            //     store.dispatch(SetCircuitSaved(false));
            // });

            storeDesigner("main", designer);

            // TODO[model_refactor](leon)
            // if (process.env.NODE_ENV === "development") {
            //     // Load dev state
            //     const files = await DevListFiles();
            //     // if (files.includes(DEV_CACHED_CIRCUIT_FILE))
            //     //     await circuit.LoadCircuit(() => DevGetFile(DEV_CACHED_CIRCUIT_FILE));
            // }

            const root = createRoot(document.getElementById("root")!);
            root.render(
                <React.StrictMode>
                    <Provider store={store}>
                        <App />
                    </Provider>
                </React.StrictMode>
            );
        }],
    ]);
}

Init();
