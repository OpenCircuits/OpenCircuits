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

import * as proto from "shared/site/proto/proto2/Circuit_pb";
import * as digital_proto from "digital/site/proto/proto2/DigitalCircuit_pb";

// import "shared/site/proto/proto2/Circuit_pb";
// import "digital/site/proto/proto2/DigitalCircuit_pb";
import {ProtoSchema} from "shared/site/proto";


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
                    const c0 = DigitalCircuitToProto(circuit as DigitalCircuit);

                    const d = new digital_proto.DigitalCircuit();
                    const c = new proto.Circuit();

                    function MakeProp(p: ProtoSchema.Prop): proto.Prop {
                        const prop = new proto.Prop();
                        if (p.intVal)
                            prop.setIntVal(p.intVal);
                        if (p.floatVal)
                            prop.setFloatVal(p.floatVal);
                        if (p.strVal)
                            prop.setStrVal(p.strVal);
                        if (p.boolVal)
                            prop.setBoolVal(p.boolVal);
                        return prop;
                    }

                    function MakeComp(c: ProtoSchema.Component): proto.Component {
                        const c2 = new proto.Component();
                        c2.setKind(c.kind);
                        if (c.icIdx !== undefined)
                            c2.setIcidx(c.icIdx);
                        if (c.portConfigIdx !== undefined)
                            c2.setPortconfigidx(c.portConfigIdx);
                        if (c.name !== undefined)
                            c2.setName(c.name);
                        if (c.x !== undefined)
                            c2.setX(c.x);
                        if (c.y !== undefined)
                            c2.setY(c.y);
                        if (c.angle !== undefined)
                            c2.setAngle(c.angle);

                        const props = c2.getOtherpropsMap();
                        for (const [key, val] of Object.entries(c.otherProps))
                            props.set(key, MakeProp(val));

                        for (const p of c.portOverrides) {
                            const port = new proto.Port();
                            port.setGroup(p.group)
                            port.setIndex(p.index);
                            if (p.name)
                                port.setName(p.name);
                            const props = port.getOtherpropsMap();
                            for (const [key, val] of Object.entries(p.otherProps))
                                props.set(key, MakeProp(val));
                            c2.addPortoverrides(port);
                        }
                        return c2;
                    }

                    function MakeWire(w: ProtoSchema.Wire): proto.Wire {
                        const w2 = new proto.Wire();
                        if (w.kind !== undefined)
                            w2.setKind(w.kind);
                        w2.setP1parentidx(w.p1ParentIdx);
                        w2.setP1group(w.p1Group);
                        w2.setP1idx(w.p1Idx);
                        w2.setP2parentidx(w.p2ParentIdx);
                        w2.setP2group(w.p2Group);
                        w2.setP2idx(w.p2Idx);
                        if (w.name !== undefined)
                            w2.setName(w.name);
                        if (w.color !== undefined)
                            w2.setColor(w.color);
                        const props = w2.getOtherpropsMap();
                        for (const [key, val] of Object.entries(w.otherProps))
                            props.set(key, MakeProp(val));
                        return w2;
                    }

                    for (const ic of c0.circuit!.ics!) {
                        const ic2 = new proto.IntegratedCircuit() as proto.IntegratedCircuit;
                        for (const comp of ic.components)
                            ic2.addComponents(MakeComp(comp));
                        for (const wire of ic.wires)
                            ic2.addWires(MakeWire(wire));
                        c.addIcs(ic2);
                    }

                    for (const comp of c0.circuit!.components!)
                        c.addComponents(MakeComp(comp));
                    for (const wire of c0.circuit!.wires!)
                        c.addWires(MakeWire(wire));

                    d.setCircuit(c);
                    d.setPropagationtime(c0.propagationTime);

                    function MakeSignal(s: DigitalProtoSchema.DigitalSimState_Signal): digital_proto.DigitalSimState.SignalMap[keyof digital_proto.DigitalSimState.SignalMap] {
                        if (s === DigitalProtoSchema.DigitalSimState_Signal.Off)
                            return 0;
                        if (s === DigitalProtoSchema.DigitalSimState_Signal.On)
                            return 1;
                        return 2;
                    }
                    function MakeSimState(s: DigitalProtoSchema.DigitalSimState): digital_proto.DigitalSimState {
                        const s2 = new digital_proto.DigitalSimState();
                        for (const sig of s.signals)
                            s2.addSignals(MakeSignal(sig));
                        const statesMap = s2.getStatesMap();
                        for (const [key, state] of Object.entries(s.states)) {
                            const s = new digital_proto.DigitalSimState.State();
                            for (const ss of state.state)
                                s.addState(MakeSignal(ss));
                            statesMap.set(parseInt(key), s);
                        }
                        const icStatesMap = s2.getIcstatesMap();
                        for (const [key, state] of Object.entries(s.icStates))
                            icStatesMap.set(parseInt(key), MakeSimState(state));
                        return s2;
                    }

                    for (const ic of c0.icInitialSimStates)
                        d.addIcinitialsimstates(MakeSimState(ic));
                    d.setSimstate(MakeSimState(c0.simState!));

                    return new Blob([d.serializeBinary()]);
                    // return new Blob(digital_proto.DigitalCircuit.serializeBinaryToWriter(d, ))
                    // return new Blob([
                    //     DigitalProtoSchema.DigitalCircuit.encode(
                    //         c0
                    //     ).finish(),
                    // ]);
                },
                SerializeCircuitAsString(circuit) {
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
                        <App />
                    </Provider>
                </React.StrictMode>
            );
        }],
    ]);
}

Init();
