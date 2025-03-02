import React, {useLayoutEffect, useRef} from "react";
import {createRoot}                     from "react-dom/client";
import ReactGA                          from "react-ga";
import {Provider}                       from "react-redux";
import {configureStore}                 from "@reduxjs/toolkit";

import {GetCookie}     from "shared/site/utils/Cookies";
import {LoadingScreen} from "shared/site/utils/LoadingScreen";

import {storeDesigner} from "shared/site/utils/hooks/useDesigner";

import {DefaultTool}      from "shared/api/circuitdesigner/tools/DefaultTool";
import {PanTool}          from "shared/api/circuitdesigner/tools/PanTool";
import {TranslateTool}    from "shared/api/circuitdesigner/tools/TranslateTool";
import {SelectionBoxTool} from "shared/api/circuitdesigner/tools/SelectionBoxTool";
import {RotateTool}       from "shared/api/circuitdesigner/tools/RotateTool";
import {WiringTool}       from "shared/api/circuitdesigner/tools/WiringTool";
import {SplitWireTool}    from "shared/api/circuitdesigner/tools/SplitWireTool";

import {CleanupHandler}     from "shared/api/circuitdesigner/tools/handlers/CleanupHandler";
import {CopyHandler}        from "shared/api/circuitdesigner/tools/handlers/CopyHandler";
import {DeleteHandler}      from "shared/api/circuitdesigner/tools/handlers/DeleteHandler";
import {DeselectAllHandler} from "shared/api/circuitdesigner/tools/handlers/DeselectAllHandler";
import {DuplicateHandler}   from "shared/api/circuitdesigner/tools/handlers/DuplicateHandler";
import {FitToScreenHandler} from "shared/api/circuitdesigner/tools/handlers/FitToScreenHandler";
import {PasteHandler}       from "shared/api/circuitdesigner/tools/handlers/PasteHandler";
import {RedoHandler}        from "shared/api/circuitdesigner/tools/handlers/RedoHandler";
import {SaveHandler}        from "shared/api/circuitdesigner/tools/handlers/SaveHandler";
import {SelectAllHandler}   from "shared/api/circuitdesigner/tools/handlers/SelectAllHandler";
import {SelectionHandler}   from "shared/api/circuitdesigner/tools/handlers/SelectionHandler";
import {SelectPathHandler}  from "shared/api/circuitdesigner/tools/handlers/SelectPathHandler";
import {SnipNodesHandler}   from "shared/api/circuitdesigner/tools/handlers/SnipNodesHandler";
import {UndoHandler}        from "shared/api/circuitdesigner/tools/handlers/UndoHandler";
import {ZoomHandler}        from "shared/api/circuitdesigner/tools/handlers/ZoomHandler";

// import {SelectionBoxToolRenderer} from "shared/api/circuitdesigner/tools/renderers/SelectionBoxToolRenderer";
// import {RotateToolRenderer}       from "shared/api/circuitdesigner/tools/renderers/RotateToolRenderer";

// import {DigitalWiringToolRenderer} from "./tools/renderers/DigitalWiringToolRenderer";

import {DevListFiles} from "shared/site/api/Dev";

import {NoAuthState} from "shared/site/api/auth/NoAuthState";

import {Login} from "shared/site/state/thunks/User";

import {AppStore} from "./state";
import {reducers} from "./state/reducers";

import ImageFiles      from "./data/images.json";
import {useWindowSize} from "shared/site/utils/hooks/useWindowSize";

import {App} from "./containers/App";
import {CreateDesigner, DigitalCircuitDesigner} from "digital/api/circuitdesigner/DigitalCircuitDesigner";
import {RenderHelper} from "shared/api/circuitdesigner/public/impl/rendering/RenderHelper";


async function Init(): Promise<void> {
    const startPercent = 30;
    let store: AppStore;

    const designer = CreateDesigner(
        {
            defaultTool: new DefaultTool(
                SelectAllHandler, FitToScreenHandler, DuplicateHandler,
                DeleteHandler, SnipNodesHandler, DeselectAllHandler,
                SelectionHandler, SelectPathHandler, RedoHandler, UndoHandler,
                CleanupHandler, CopyHandler, PasteHandler, ZoomHandler,
                SaveHandler(() => store.getState().user.isLoggedIn /* && helpers.SaveCircuitRemote() */)
            ),
            tools: [
                PanTool,
                new RotateTool(), new TranslateTool(),
                new WiringTool(), new SplitWireTool(),
                new SelectionBoxTool(),
            ],
            // renderers: [RotateToolRenderer, new DigitalWiringToolRenderer(), SelectionBoxToolRenderer],
        },
    );

    // const renderers = [RotateToolRenderer, new DigitalWiringToolRenderer(), SelectionBoxToolRenderer]
    designer.viewport.observe("onrender", (ev) => {
        // renderers.forEach((toolRenderer) => toolRenderer.render(
        //     ...
        // ));
    })

    await LoadingScreen("loading-screen", startPercent, [
        [80, "Loading Images", async (onProgress) => {
            // await designer.circuit.loadImages(ImageFiles.images, onProgress);
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
