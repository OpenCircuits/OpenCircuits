import {CreateCircuit, DigitalCircuit}             from "digital/public";
import React, {useEffect, useLayoutEffect, useRef} from "react";
import ReactDOM                                    from "react-dom";
import ReactGA                                     from "react-ga";
import {Provider}                                  from "react-redux";
import {applyMiddleware, createStore}              from "redux";
import thunk, {ThunkMiddleware}                    from "redux-thunk";

import {GetCookie}     from "shared/utils/Cookies";
import {LoadingScreen} from "shared/utils/LoadingScreen";

import {storeCircuit} from "shared/utils/hooks/useCircuit";

import {DevListFiles} from "shared/api/Dev";

import {NoAuthState} from "shared/api/auth/NoAuthState";

import {Login} from "shared/state/thunks/User";

import {App}                from "./containers/App";
import {AppState, AppStore} from "./state";
import {AllActions}         from "./state/actions";
import {reducers}           from "./state/reducers";

import ImageFiles         from "./data/images.json";
import {useWindowSize}    from "shared/utils/hooks/useWindowSize";
import {useDeltaMousePos} from "shared/utils/hooks/useMousePos";
import {useKey}           from "shared/utils/hooks/useKey";
import {V}                from "Vector";
import {useDocEvent}      from "shared/utils/hooks/useDocEvent";


const usePanTool = (circuit: DigitalCircuit) => {
    const { dx, dy, isMouseDown } = useDeltaMousePos();
    const altKey = useKey("Alt");

    useEffect(() => {
        if (!altKey || !isMouseDown)
            return;
        circuit.camera.translate(V(-dx, -dy, "screen"));
    }, [circuit, dx, dy, isMouseDown, altKey]);
}

const useZoomTool = (circuit: DigitalCircuit) => {
    useDocEvent("wheel", (ev) => {
        const dy = ev.deltaY;
        const pos = V(ev.pageX, ev.pageY);

        let zoomFactor = 0.95;
        if (dy >= 0)
            zoomFactor = 1 / zoomFactor;

        circuit.camera.zoomTo(zoomFactor, pos);
    }, [circuit]);
}

const MainCircuit = ({ circuit }: { circuit: DigitalCircuit }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { w, h } = useWindowSize();

    usePanTool(circuit);
    useZoomTool(circuit);

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        (window as any).Circuit = circuit;
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

    const circuit = CreateCircuit();

    await LoadingScreen("loading-screen", startPercent, [
        [80, "Loading Images", async (onProgress) => {
            await circuit.loadImages(ImageFiles.images, onProgress);
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

            ReactDOM.render(
                <React.StrictMode>
                    <MainCircuit circuit={circuit} />
                </React.StrictMode>,
                document.getElementById("root")
            );
        }],
    ]);
}

Init();
