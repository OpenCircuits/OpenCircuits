import React, {useLayoutEffect, useRef} from "react";
import {createRoot}                     from "react-dom/client";
import ReactGA                          from "react-ga";
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

import {ZoomHandler}      from "shared/tools/handlers/ZoomHandler";
import {SelectionHandler} from "shared/tools/handlers/SelectionHandler";
import {SelectAllHandler} from "shared/tools/handlers/SelectAllHandler";

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

import {DigitalCircuitDesigner} from "./utils/DigitalCircuitDesigner";


const MainCircuit = ({ designer }: { designer: DigitalCircuitDesigner }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { w, h } = useWindowSize();

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        (window as any).Circuit = designer.circuit;
        return designer.attachCanvas(canvas);
    }, [designer, canvasRef]);

    useLayoutEffect(() => designer.circuit.resize(w, h), [designer, w, h]);

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

    const designer = CreateDesigner(
        CreateCircuit(),
        {
            defaultTool: new DefaultTool(ZoomHandler, SelectionHandler, SelectAllHandler),
            tools:       [
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
                    <MainCircuit designer={designer} />
                </React.StrictMode>
            );
        }],
    ]);
}

Init();
