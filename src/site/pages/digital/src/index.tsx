import {CreateCircuit, DigitalCircuit}                                             from "digital/public";
import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import {createRoot}                                                                from "react-dom/client";
import ReactGA                                                                     from "react-ga";

import {GetCookie}     from "shared/utils/Cookies";
import {LoadingScreen} from "shared/utils/LoadingScreen";

import {storeCircuit} from "shared/utils/hooks/useCircuit";

import {Tool}        from "shared/tools/Tool";
import {DefaultTool} from "shared/tools/DefaultTool";
import {PanTool}     from "shared/tools/PanTool";
import {ZoomHandler} from "shared/tools/handlers/ZoomHandler";

import {DevListFiles} from "shared/api/Dev";

import {NoAuthState} from "shared/api/auth/NoAuthState";

import {Login} from "shared/state/thunks/User";

import {AppStore} from "./state";
import {reducers} from "./state/reducers";

import ImageFiles          from "./data/images.json";
import {useWindowSize}     from "shared/utils/hooks/useWindowSize";
import {Circuit}           from "core/public";
import {InputManagerEvent} from "shared/utils/input/InputManagerEvent";
import {InputManager}      from "shared/utils/input/InputManager";
import {configureStore}    from "@reduxjs/toolkit";


interface ToolConfig {
    defaultTool: DefaultTool;
    tools: Tool[];
}

// const useCircuitEvent = <T extends string>(
//     type: T,
//     f: (ev: any & { type: T }) => void,
//     circuit: Circuit,
//     deps?: React.DependencyList,
// ) => {
//     useEffect(() => circuit.subscribe((ev) => {
//         if (ev.type === type)
//             f(ev);
//     }), [circuit, type, f, ...(deps ?? [])]);
// }

const useInputEvents = (circuit: Circuit, handler: (ev: InputManagerEvent) => void) => {
    const inputManager = useMemo(() => new InputManager(), []);

    useEffect(() => {
        if (circuit.canvas) {
            inputManager.tearDown();
            inputManager.setupOn(circuit.canvas);
        }

        return circuit.subscribe((ev) => {
            if (ev.type === "attachCanvas")
                inputManager.setupOn(ev.canvas);
            if (ev.type === "detachCanvas")
                inputManager.tearDown();
        });
    }, [circuit, inputManager]);

    useEffect(() => inputManager.subscribe((ev) => handler(ev)), [inputManager, handler]);
}

const useTools = (circuit: DigitalCircuit, { defaultTool, tools }: ToolConfig) => {
    const [curTool, setCurTool] = useState(undefined as Tool | undefined);

    const handler = useCallback((ev: InputManagerEvent) => {
        // Call the current tool's (or default tool's) onEvent method
        if (curTool) {
            curTool.onEvent(ev, circuit);
            // Check if we should deactivate the current tool
            if (curTool.shouldDeactivate(ev, circuit)) {
                // Deactivate the tool
                curTool.onDeactivate(ev, circuit);
                setCurTool(undefined);
                defaultTool.onActivate(ev, circuit);
                return;
            }
            return;
        }

        // Check if some other tool should be activated
        const newTool = tools.find((t) => t.shouldActivate(ev, circuit));
        if (newTool !== undefined) {
            setCurTool(newTool);
            newTool.onActivate(ev, circuit);
            return;
        }

        // Specifically do defaultTool's `onEvent` last
        //  which means that Tool activations will take priority
        //  over the default behavior for things like Handlers
        //  Fixes #624
        defaultTool.onEvent(ev, circuit);
    }, [circuit, defaultTool, tools, curTool]);

    useInputEvents(circuit, handler);
}

const MainCircuit = ({ circuit }: { circuit: DigitalCircuit }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { w, h } = useWindowSize();

    const toolConfig = useMemo<ToolConfig>(() => ({
        defaultTool: new DefaultTool(
            ZoomHandler,
        ),
        tools: [PanTool],
    }), []);

    useTools(circuit, toolConfig);

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        (window as unknown as { Circuit: Circuit }).Circuit = circuit;
        return circuit.attachCanvas(canvas);
    }, [circuit, canvasRef]);

    useLayoutEffect(() => circuit.resize(w, h), [circuit, w, h]);

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

    const circuit = CreateCircuit();

    await LoadingScreen("loading-screen", startPercent, [
        [80, "Loading Images", async (onProgress) => {
            await circuit.loadImages(ImageFiles.images, onProgress);
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

            storeCircuit("main", circuit);

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
                    <MainCircuit circuit={circuit} />
                </React.StrictMode>
            );
        }],
    ]);
}

Init();
