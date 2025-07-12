import {initializeApp} from "firebase/app";
import {browserLocalPersistence, getAuth, onAuthStateChanged, setPersistence} from "firebase/auth";

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

import {SelectionBoxToolRenderer} from "shared/api/circuitdesigner/tools/renderers/SelectionBoxToolRenderer";
import {RotateToolRenderer}       from "shared/api/circuitdesigner/tools/renderers/RotateToolRenderer";
import {WiringToolRenderer}       from "shared/api/circuitdesigner/tools/renderers/WiringToolRenderer";

import {CreateDesigner} from "analog/api/circuitdesigner/AnalogCircuitDesigner";

import {DevGetFile, DevListFiles} from "shared/site/api/Dev";

import {NoAuthState} from "shared/site/api/auth/NoAuthState";

import {Login} from "shared/site/state/thunks/User";

import {AppStore} from "./state";
import {reducers} from "./state/reducers";

import {App} from "./containers/App";
import {DEV_CACHED_CIRCUIT_FILE} from "shared/site/utils/Constants";
import {CircuitHelpers, SetCircuitHelpers} from "shared/site/utils/CircuitHelpers";

// import {DigitalProtoSchema} from "digital/site/proto";
import {CreateCircuit} from "analog/api/circuit/public";
import {DRAG_TIME} from "shared/api/circuitdesigner/input/Constants";
// import {DigitalCircuitToProto, DigitalProtoToCircuit} from "digital/site/proto/bridge";
// import {PrintDebugStats} from "./proto/debug";
// import {CUR_SAVE_VERSION} from "./utils/Constants";
import {GetAuthMethods} from "shared/site/containers/LoginPopup/GetAuthMethods";
import {GoogleAuthState} from "shared/site/api/auth/GoogleAuthState";

import NGSpice from "./lib/ngspice.wasm";
import {NGSpiceLib} from "./lib/NGSpiceLib";


async function Init(): Promise<void> {
    const startPercent = 10;
    let store: AppStore;
    let ngSpiceLib: NGSpiceLib;

    await LoadingScreen("loading-screen", startPercent, [
        [80, "Loading NGSpice Library", async () => {
            ngSpiceLib = await NGSpice();
            if (!ngSpiceLib)
                console.error("Failed to load NGSpice WASM binary!");
            ngSpiceLib.OC_init();
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
                    const firebaseConfig = process.env.OC_FIREBASE_CONFIG;
                    if (!firebaseConfig)
                        throw new Error("No firebase config specified!");
                    const app = initializeApp(JSON.parse(firebaseConfig));

                    const auth = getAuth(app);
                    await setPersistence(auth, browserLocalPersistence);

                    onAuthStateChanged(auth, async (user) => {
                        if (user) {
                            await store.dispatch(Login(new GoogleAuthState(await user.getIdToken(), user.displayName ?? "")));
                        }
                    });
                },
            };
            try {
                const authMethods = GetAuthMethods();
                if (authMethods.length > 0)
                    await Promise.all(authMethods.map((a) => AuthMethods[a]()));
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
                    return CreateDesigner(
                        tools?.config ?? {
                            defaultTool: new DefaultTool(
                                SelectAllHandler, FitToScreenHandler, DuplicateHandler,
                                DeleteHandler, SnipNodesHandler, DeselectAllHandler,
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
                        tools?.renderers ?? [RotateToolRenderer, WiringToolRenderer(({ renderer }) => renderer.options.defaultWireColor), SelectionBoxToolRenderer],
                        DRAG_TIME,
                        CreateCircuit(),
                    );
                },
                Serialize(circuitOrObjs) {
                    throw new Error("Unimplemented!");
                },
                SerializeAsString(circuitOrObjs) {
                    throw new Error("Unimplemented!");
                },
                DeserializeCircuit(data) {
                    throw new Error("Unimplemented!");
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
