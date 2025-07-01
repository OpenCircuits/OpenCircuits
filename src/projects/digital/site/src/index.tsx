/* eslint-disable no-console */
import React            from "react";
import {createRoot}     from "react-dom/client";
import ReactGA          from "react-ga";
import {Provider}       from "react-redux";
import {configureStore} from "@reduxjs/toolkit";

import {GetCookie}     from "shared/site/utils/Cookies";
import {LoadingScreen} from "shared/site/utils/LoadingScreen";

import {setCurDesigner} from "shared/site/utils/hooks/useDesigner";

import {Circuit}      from "shared/api/circuit/public/Circuit";
import {ObjContainer} from "shared/api/circuit/public/ObjContainer";

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
import {CUR_SAVE_VERSION} from "./utils/Constants";
import {GoogleOAuthProvider} from "@react-oauth/google";
import {GetAuthMethods} from "shared/site/containers/LoginPopup/GetAuthMethods";


// This library is very frustrating...
const GoogleOAuthProvider2 = GoogleOAuthProvider as (...props: Parameters<typeof GoogleOAuthProvider>) => React.ReactElement;

async function Init(): Promise<void> {
    const startPercent = 30;
    let store: AppStore;

    await LoadingScreen("loading-screen", startPercent, [
        [40, "Initializing redux", async () => {
            store = configureStore({ reducer: reducers });
        }],

        [80, "Initializing Authentication", async () => {
            const AuthMethods: Record<string, () => Promise<void>> = {
                "no_auth": async () => {
                    const username = GetCookie("no_auth_username");
                    if (username)
                        await store.dispatch(Login(new NoAuthState(username)));
                },
                "google": async () => {},
            };
            try {
                const authMethods = GetAuthMethods();
                if (authMethods.length > 0)
                    await Promise.all(authMethods.map((a) => AuthMethods[a]()));
            } catch (e) {
                console.error(e);
            }
        }],
        [90, "Google Analytics", async () => {
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
            const GetCircuitFromCircuitOrObjs = (circuitOrObjs: Circuit | ObjContainer) => {
                if ("length" in circuitOrObjs) {
                    const [circuit, _] = CreateCircuit();
                    circuit.import(circuitOrObjs as DigitalObjContainer);
                    return circuit;
                }
                return circuitOrObjs;
            };

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
                                CopyHandler((objs) => CircuitHelpers.SerializeAsString(objs)),
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
                    mainCircuitState.simRunner = new TimedDigitalSimRunner(mainCircuitState.sim, 1000 / 20);

                    return mainDesigner;
                },
                Serialize(circuitOrObjs) {
                    const circuit = GetCircuitFromCircuitOrObjs(circuitOrObjs);
                    const proto = DigitalCircuitToProto(circuit as DigitalCircuit);

                    // Log debug-stats
                    if (process.env.NODE_ENV === "development")
                        PrintDebugStats(proto);

                    return {
                        data:    new Blob([DigitalProtoSchema.DigitalCircuit.encode(proto).finish()]),
                        version: CUR_SAVE_VERSION,
                    };
                },
                SerializeAsString(circuitOrObjs) {
                    const circuit = GetCircuitFromCircuitOrObjs(circuitOrObjs);
                    return JSON.stringify(DigitalCircuitToProto(circuit as DigitalCircuit));
                },
                DeserializeCircuit(data) {
                    const schema = (() => {
                        if (typeof data === "string")
                            return VersionMigrator(data).schema;

                        try {
                            const proto = DigitalProtoSchema.DigitalCircuit.decode(new Uint8Array(data));
                            // TODO[] -- switch protobuf libraries cause this thing sucks
                            if (!proto.circuit)
                                throw new Error("Failed to parse!");
                            return proto;
                        } catch {
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
                        {GetAuthMethods().includes("google") ? (
                            <GoogleOAuthProvider2 clientId={process.env.OC_OAUTH2_ID!}>
                                <App />
                            </GoogleOAuthProvider2>
                        ) : <App />}
                    </Provider>
                </React.StrictMode>
            );
        }],
    ]);
}

Init();
