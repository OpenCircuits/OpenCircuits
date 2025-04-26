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

import {InteractionHandler} from "digital/api/circuitdesigner/tools/handlers/InteractionHandler";

import {SelectionBoxToolRenderer} from "shared/api/circuitdesigner/tools/renderers/SelectionBoxToolRenderer";
import {RotateToolRenderer}       from "shared/api/circuitdesigner/tools/renderers/RotateToolRenderer";

import {DigitalWiringToolRenderer} from "./tools/renderers/DigitalWiringToolRenderer";

import {DevGetFile, DevListFiles} from "shared/site/api/Dev";

import {NoAuthState} from "shared/site/api/auth/NoAuthState";

import {Login} from "shared/site/state/thunks/User";

import {AppStore} from "./state";
import {reducers} from "./state/reducers";

import ImageFiles      from "./data/images.json";
import {useWindowSize} from "shared/site/utils/hooks/useWindowSize";

import {App} from "./containers/App";
import {CreateDesigner, DigitalCircuitDesigner} from "digital/api/circuitdesigner/DigitalCircuitDesigner";
import {DEV_CACHED_CIRCUIT_FILE} from "shared/site/utils/Constants";
import {LoadCircuit} from "shared/site/utils/CircuitHelpers";
import {Request} from "shared/site/utils/Request";
import {SetCircuitSaved} from "shared/site/state/CircuitInfo";
import {VersionConflictResolver} from "./utils/DigitalVersionConflictResolver";
import {setDeserializeCircuitFunc, setSerializeCircuitFunc} from "shared/site/utils/CircuitIOMethods";
import {Schema} from "digital/api/circuit/schema";

import {DigitalProtoSchema} from "digital/site/proto";
import {ProtoSchema} from "shared/site/proto";
import {MapObj} from "shared/api/circuit/utils/Functions";
import {v4, parse, stringify} from "uuid";
import {Signal} from "digital/api/circuit/internal/sim/Signal";
import {DigitalCircuit} from "digital/api/circuit/public";
import {Circuit} from "shared/api/circuit/public";
import {CreateCircuit} from "digital/api/circuit/public";
import {DRAG_TIME} from "shared/api/circuitdesigner/input/Constants";
import {TimedDigitalSimRunner} from "digital/api/circuit/internal/sim/TimedDigitalSimRunner";


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
            const [mainCircuit, mainCircuitState] = CreateCircuit();
            const mainDesigner = CreateDesigner(
                {
                    defaultTool: new DefaultTool(
                        SelectAllHandler, FitToScreenHandler, DuplicateHandler,
                        DeleteHandler, SnipNodesHandler, DeselectAllHandler,
                        InteractionHandler,  // Needs to be before the selection and select path handlers
                        SelectionHandler, SelectPathHandler, RedoHandler, UndoHandler,
                        CleanupHandler, CopyHandler, PasteHandler, ZoomHandler,
                        SaveHandler(() => store.getState().user.isLoggedIn /* && helpers.SaveCircuitRemote() */)
                    ),
                    tools: [
                        new PanTool(),
                        new RotateTool(), new TranslateTool(),
                        new WiringTool(), new SplitWireTool(),
                        new SelectionBoxTool(),
                    ],
                },
                [RotateToolRenderer, DigitalWiringToolRenderer, SelectionBoxToolRenderer],
                DRAG_TIME,
                [mainCircuit, mainCircuitState],
            );
            // Setup propagator
            mainCircuitState.simRunner = new TimedDigitalSimRunner(mainCircuitState.sim, 1);

            mainDesigner.circuit.subscribe((_ev) => {
                store.dispatch(SetCircuitSaved(false));
            });

            storeDesigner("main", mainDesigner);

            setSerializeCircuitFunc((circuit: Circuit) => {
                const schema = (circuit as DigitalCircuit).toSchema();

                function GetProps(obj: Schema.Core.Obj): Record<string, ProtoSchema.Prop> {
                    return MapObj(obj.props, ([_key, prop]) =>
                                (typeof prop === "boolean"
                                    ? { boolVal: prop }
                                    : (typeof prop === "number")
                                    ? (Number.isInteger(prop)
                                        ? { intVal: prop }
                                        : { floatVal: prop })
                                    : (typeof prop === "string")
                                    ? { strVal: prop } : {}));
                }

                function LoadObjs(objs: Schema.Core.Obj[]): { components: ProtoSchema.Component[], wires: ProtoSchema.Wire[], ports: ProtoSchema.Port[] } {
                    return {
                        components: objs
                            .filter((o) => (o.baseKind === "Component"))
                            .map((c) => ({
                                id:    parse(c.id) as Uint8Array,
                                kind:  c.kind,
                                props: GetProps(c),
                            })),
                        wires: objs
                            .filter((o) => (o.baseKind === "Wire"))
                            .map((w) => ({
                                id:    parse(w.id) as Uint8Array,
                                kind:  w.kind,
                                props: GetProps(w),
                                p1:    parse(w.p1) as Uint8Array,
                                p2:    parse(w.p2) as Uint8Array,
                            })),
                        ports: objs
                            .filter((o) => (o.baseKind === "Port"))
                            .map((p) => ({
                                id:     parse(p.id) as Uint8Array,
                                kind:   p.kind,
                                props:  GetProps(p),
                                parent: parse(p.parent) as Uint8Array,
                                group:  p.group,
                                index:  p.index,
                            })),
                    };
                }

                function LoadSignal(signal: Signal): DigitalProtoSchema.DigitalSimState_Signal {
                    return (signal === Signal.On
                        ? DigitalProtoSchema.DigitalSimState_Signal.On
                        : (signal === Signal.Off)
                        ? DigitalProtoSchema.DigitalSimState_Signal.Off
                        : (signal === Signal.Metastable)
                        ? DigitalProtoSchema.DigitalSimState_Signal.Metastable
                        : DigitalProtoSchema.DigitalSimState_Signal.UNRECOGNIZED);
                }

                function LoadSimState(state: Schema.DigitalSimState): DigitalProtoSchema.DigitalSimState {
                    return {
                        signals:  MapObj(state.signals,  ([_id, signal]) => LoadSignal(signal)),
                        states:   MapObj(state.states,   ([_id, state])  => ({ state: state.map(LoadSignal) })),
                        icStates: MapObj(state.icStates, ([_id, state])  => LoadSimState(state)),
                    };
                }

                const proto = DigitalProtoSchema.DigitalCircuit.create({
                    circuit: {
                        metadata: {
                            ...schema.metadata,
                            id: parse(schema.metadata.id) as Uint8Array,
                        },
                        camera: schema.camera,
                        ics:    schema.ics.map((ic) => ({
                            metadata: {
                                metadata: {
                                    id:   parse(ic.metadata.id) as Uint8Array,
                                    name: ic.metadata.name,
                                },
                                displayWidth:  ic.metadata.displayWidth,
                                displayHeight: ic.metadata.displayHeight,
                                pins:          ic.metadata.pins.map((p) => ({
                                    ...p,
                                    id: parse(p.id) as Uint8Array,
                                })),
                            },
                            ...LoadObjs(ic.objects),
                        })),
                        ...LoadObjs(schema.objects),
                    },

                    propagationTime: schema.propagationTime,

                    icInitialSimStates: schema.ics.map((ic) => LoadSimState(ic.initialSimState)),

                    simState: LoadSimState(schema.simState),
                });

                return new Blob([DigitalProtoSchema.DigitalCircuit.encode(proto).finish()]);
                // return new Blob([JSON.stringify(schema)], { type: "text/json" });
            });
            setDeserializeCircuitFunc((data) => {
                if (typeof data === "string")
                    return VersionConflictResolver(data).schema;

                const protoCircuit = DigitalProtoSchema.DigitalCircuit.decode(new Uint8Array(data));

                function GetProps(props: Record<string, ProtoSchema.Prop>): Schema.Core.Obj["props"] {
                    return MapObj(props, ([_key, prop]) =>
                                    prop.boolVal ?? prop.floatVal ?? prop.intVal ?? prop.strVal ?? ""
                                    );
                }

                function LoadObjs(components: ProtoSchema.Component[], wires: ProtoSchema.Wire[], ports: ProtoSchema.Port[]): Schema.Core.Obj[] {
                    return [
                        ...components.map((c) => ({
                            baseKind: "Component",
                            ...c,
                            id: stringify(c.id),
                            props: GetProps(c.props),
                        } as Schema.Core.Component)),
                        ...wires.map((w) => ({
                            baseKind: "Wire",
                            ...w,
                            id: stringify(w.id),
                            props: GetProps(w.props),
                            p1: stringify(w.p1),
                            p2: stringify(w.p2),
                        } as Schema.Core.Wire)),
                        ...ports.map((p) => ({
                            baseKind: "Port",
                            ...p,
                            id: stringify(p.id),
                            props: GetProps(p.props),
                            parent: stringify(p.parent),
                        } as Schema.Core.Port))
                    ];
                }

                function LoadSignal(signal: DigitalProtoSchema.DigitalSimState_Signal): Signal {
                    return (signal === DigitalProtoSchema.DigitalSimState_Signal.On
                        ? Signal.On
                        : (signal === DigitalProtoSchema.DigitalSimState_Signal.Off)
                        ? Signal.Off
                        : (signal === DigitalProtoSchema.DigitalSimState_Signal.Metastable)
                        ? Signal.Metastable
                        : Signal.Off);
                }

                function LoadSimState(state: DigitalProtoSchema.DigitalSimState): Schema.DigitalSimState {
                    return {
                        signals:  MapObj(state.signals,  ([_id, signal]) => LoadSignal(signal)),
                        states:   MapObj(state.states,   ([_id, state])  => state.state.map(LoadSignal)),
                        icStates: MapObj(state.icStates, ([_id, state])  => LoadSimState(state)),
                    };
                }

                return {
                    metadata: {
                        ...protoCircuit.circuit!.metadata!,
                        id: stringify(protoCircuit.circuit!.metadata!.id),
                    } as Schema.Core.CircuitMetadata,
                    camera: protoCircuit.circuit!.camera!,
                    ics: protoCircuit.circuit!.ics!.map((ic, i) => ({
                        metadata: {
                            ...ic.metadata!,
                            ...ic.metadata!.metadata!,
                            id: stringify(ic.metadata!.metadata!.id),
                            pins: ic.metadata!.pins.map((p) => ({
                                ...p,
                                id: stringify(p.id),
                            })),
                        } as Schema.Core.IntegratedCircuitMetadata,
                        objects: LoadObjs(ic.components, ic.wires, ic.ports),
                        initialSimState: LoadSimState(protoCircuit.icInitialSimStates[i]),
                    })),
                    objects: LoadObjs(protoCircuit.circuit!.components, protoCircuit.circuit!.wires, protoCircuit.circuit!.ports),

                    propagationTime: protoCircuit.propagationTime,
                    simState: LoadSimState(protoCircuit.simState!),
                } satisfies Schema.DigitalCircuit;
            });

            if (process.env.NODE_ENV === "development") {
                // Load dev state
                const files = await DevListFiles();
                if (files.includes(DEV_CACHED_CIRCUIT_FILE))
                    LoadCircuit(mainDesigner.circuit, VersionConflictResolver(await DevGetFile(DEV_CACHED_CIRCUIT_FILE)).schema);
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
