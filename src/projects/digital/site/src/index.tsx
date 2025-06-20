/* eslint-disable no-console */
import React            from "react";
import {createRoot}     from "react-dom/client";
import ReactGA          from "react-ga";
import {Provider}       from "react-redux";
import {configureStore} from "@reduxjs/toolkit";

import {GetCookie}     from "shared/site/utils/Cookies";
import {LoadingScreen} from "shared/site/utils/LoadingScreen";

import {setCurDesigner} from "shared/site/utils/hooks/useDesigner";

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

import {InteractionHandler} from "digital/api/circuitdesigner/tools/handlers/InteractionHandler";

import {SelectionBoxToolRenderer} from "shared/api/circuitdesigner/tools/renderers/SelectionBoxToolRenderer";
import {RotateToolRenderer}       from "shared/api/circuitdesigner/tools/renderers/RotateToolRenderer";

import {DigitalWiringToolRenderer} from "./tools/renderers/DigitalWiringToolRenderer";

import {DevGetFile, DevListFiles} from "shared/site/api/Dev";

import {NoAuthState} from "shared/site/api/auth/NoAuthState";

import {Login} from "shared/site/state/thunks/User";

import {AppStore} from "./state";
import {reducers} from "./state/reducers";

import {App} from "./containers/App";
import {CreateDesigner} from "digital/api/circuitdesigner/DigitalCircuitDesigner";
import {DEV_CACHED_CIRCUIT_FILE} from "shared/site/utils/Constants";
import {VersionMigrator} from "./utils/VersionMigrator";
import {CircuitHelpers, SetCircuitHelpers} from "shared/site/utils/CircuitHelpers";

import {DigitalProtoSchema} from "digital/site/proto";
import {CreateCircuit, DigitalCircuit, DigitalObjContainer} from "digital/api/circuit/public";
import {DRAG_TIME} from "shared/api/circuitdesigner/input/Constants";
import {TimedDigitalSimRunner} from "digital/api/circuit/internal/sim/TimedDigitalSimRunner";
import {DigitalCircuitToProto, DigitalProtoToCircuit} from "digital/site/proto/bridge";
import {PrintDebugStats} from "./proto/debug";


async function Init(): Promise<void> {
    const startPercent = 30;
    let store: AppStore;

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
                console.log(process.env.OC_AUTH_TYPES);
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
            SetCircuitHelpers({
                CreateAndInitializeDesigner(tools) {
                    const [mainCircuit, mainCircuitState] = CreateCircuit();
                    const mainDesigner = CreateDesigner(
                        tools?.config ?? {
                            defaultTool: new DefaultTool(
                                SelectAllHandler, FitToScreenHandler, DuplicateHandler,
                                DeleteHandler, SnipNodesHandler, DeselectAllHandler,
                                InteractionHandler,  // Needs to be before the selection and select path handlers
                                SelectionHandler, SelectPathHandler, RedoHandler, UndoHandler,
                                CleanupHandler, ZoomHandler,
                                CopyHandler((objs) => {
                                    const [circuit, _] = CreateCircuit();
                                    circuit.import(objs as DigitalObjContainer);
                                    return JSON.stringify(DigitalCircuitToProto(circuit));
                                }),
                                PasteHandler((str) => CircuitHelpers.DeserializeCircuit(str)),
                                SaveHandler(() => store.getState().user.isLoggedIn /* && helpers.SaveCircuitRemote() */)
                            ),
                            tools: [
                                new PanTool(),
                                new RotateTool(), new TranslateTool(),
                                new WiringTool(), new SplitWireTool(),
                                new SelectionBoxTool(),
                            ],
                        },
                        tools?.renderers ?? [RotateToolRenderer, DigitalWiringToolRenderer, SelectionBoxToolRenderer],
                        DRAG_TIME,
                        [mainCircuit, mainCircuitState],
                    );
                    // Setup propagator
                    mainCircuitState.simRunner = new TimedDigitalSimRunner(mainCircuitState.sim, 1);

                    return mainDesigner;
                },
                SerializeCircuit(circuit) {
                    const proto = DigitalCircuitToProto(circuit as DigitalCircuit);

                    // Log debug-stats
                    if (process.env.NODE_ENV === "development")
                        PrintDebugStats(proto);

                    return new Blob([DigitalProtoSchema.DigitalCircuit.encode(proto).finish()]);
                },
                SerializeCircuitAsString(circuit) {
                    return JSON.stringify(DigitalCircuitToProto(circuit as DigitalCircuit));
                },
                DeserializeCircuit(data) {
                    const schema = (() => {
                        console.log(data);
                        if (typeof data === "string")
                            return VersionMigrator(data).schema;

                        try {
                            const proto = DigitalProtoSchema.DigitalCircuit.decode(new Uint8Array(data));
                            // TODO[] -- switch protobuf libraries cause this thing sucks
                            if (!proto.circuit)
                                throw new Error("Failed to parse!");
                            return proto;
                        } catch(e) {
                            console.log(e);
                            // If we failed to decode it, it could be an old version of the circuit format
                            // (plain text), so decode as plain text and run through VersionMigrator.
                            const text = new TextDecoder().decode(data);
                            return VersionMigrator(text).schema;
                        }
                    })();
                    return DigitalProtoToCircuit(schema);
                },
            });

            const mainDesigner = CircuitHelpers.CreateAndInitializeDesigner();

            setCurDesigner(mainDesigner);

            // Load cached circuit (dev-mode only)
            if (process.env.NODE_ENV === "development") {
                const files = await DevListFiles();
                if (files.includes(DEV_CACHED_CIRCUIT_FILE))
                    CircuitHelpers.LoadNewCircuit(await DevGetFile(DEV_CACHED_CIRCUIT_FILE));
            }

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
