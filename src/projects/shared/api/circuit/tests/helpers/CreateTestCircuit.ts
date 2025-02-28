import "../Extensions";

import {V, Vector} from "Vector";

import {extend}         from "shared/api/circuit/utils/Functions";
import {OkVoid, Result} from "shared/api/circuit/utils/Result";

import {Schema} from "shared/api/circuit/schema";

import {Circuit, Component, Port, RootCircuit, Wire, uuid} from "shared/api/circuit/public";
import {RootCircuitImpl}                             from "shared/api/circuit/public/impl/Circuit";
import {CircuitState, CircuitTypes}                  from "shared/api/circuit/public/impl/CircuitState";
import {ComponentImpl}                               from "shared/api/circuit/public/impl/Component";
import {ComponentInfoImpl}                           from "shared/api/circuit/public/impl/ComponentInfo";
import {PortImpl}                                    from "shared/api/circuit/public/impl/Port";
import {WireImpl}                                    from "shared/api/circuit/public/impl/Wire";

import {CircuitInternal, GUID}           from "shared/api/circuit/internal";
import {CircuitAssembler}                from "shared/api/circuit/internal/assembly/CircuitAssembler";
import {DefaultRenderOptions}            from "shared/api/circuit/internal/assembly/RenderOptions";
import {NodeAssembler}                   from "shared/api/circuit/internal/assembly/NodeAssembler";
import {WireAssembler}                   from "shared/api/circuit/internal/assembly/WireAssembler";
import {CircuitLog}                      from "shared/api/circuit/internal/impl/CircuitLog";
import {CircuitDocument}                 from "shared/api/circuit/internal/impl/CircuitDocument";
import {BaseComponentInfo, BaseObjInfo,
        BaseObjInfoProvider, PortConfig} from "shared/api/circuit/internal/impl/ComponentInfo";
import {SelectionsManager}               from "shared/api/circuit/internal/impl/SelectionsManager";


export class TestComponentInfo extends BaseComponentInfo {
    protected override getPortInfo(_p: PortConfig, _group: string, _i: number): Pick<Schema.Port, "kind" | "props"> {
        return {
            kind:  "TestPort",
            props: {},
        };
    }
    public override checkPortConnectivity(_wires: Map<Schema.Port, Schema.Port[]>): Result {
        return OkVoid();
    }
}

export function TestComponentImpl(circuit: Circuit, state: CircuitState<CircuitTypes>, id: GUID) {
    const base = ComponentImpl(circuit, state, id);
    return extend(base, {
        get info() {
            return ComponentInfoImpl(state, base.kind);
        },
        isNode(): boolean {
            return (false);
        },
    } as const) satisfies Component;
}

export function TestWireImpl(circuit: Circuit, state: CircuitState<CircuitTypes>, id: GUID) {
    return WireImpl(circuit, state, id, () => { throw new Error("TestWireImpl: Unimplemented!"); });
}

export function TestPortImpl(circuit: Circuit, state: CircuitState<CircuitTypes>, id: GUID) {
    const base = PortImpl(circuit, state, id);
    return extend(base, {
        connectTo(other: Port) {
            state.internal.beginTransaction();
            const id = state.internal.connectWire("TestWire", base.id, other.id, {}).unwrap();
            state.internal.commitTransaction();
            return state.constructWire(id);
        },
        getLegalWires(): Port.LegalWiresQuery {
            return {
                isWireable: true,
                contains:   (_: Port) => (true),
            }
        },
    } as const) satisfies Port;
}

export interface TestRootCircuitHelpers {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    PlaceAt(...positions: Vector[]): Component[];
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Connect(c1: Component, c2: Component): Wire;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    GetPort(c: Component): Port;
}

export function CreateTestRootCircuit(): [RootCircuit, CircuitState<CircuitTypes>, TestRootCircuitHelpers] {
    const internal = new CircuitInternal(
        uuid(),
        new CircuitLog(),
        new CircuitDocument(new BaseObjInfoProvider(
            [new TestComponentInfo("TestComp", {}, [""], [{ "": 1 }])],
            [new BaseObjInfo("Wire", "TestWire", {})],
            [new BaseObjInfo("Port", "TestPort", {})],
        )),
    );
    const renderOptions = new DefaultRenderOptions();
    const selectionsManager = new SelectionsManager();
    const assembler = new CircuitAssembler(internal, selectionsManager, renderOptions, (params) => ({
        "TestWire": new WireAssembler(params),
        "TestComp": new NodeAssembler(params, { "": () => ({ origin: V(0, 0), target: V(1, 0) }) }),
    }));

    const state: CircuitState<CircuitTypes> = {
        internal, assembler, selectionsManager, renderOptions,

        constructComponent(id) {
            return TestComponentImpl(circuit, state, id);
        },
        constructWire(id) {
            return TestWireImpl(circuit, state, id);
        },
        constructPort(id) {
            return TestPortImpl(circuit, state, id);
        },
    }
    const circuit = RootCircuitImpl(state);

    return [circuit, state, {
        PlaceAt: (...positions) => positions.map((p) => circuit.placeComponentAt("TestComp", p)),
        Connect: (c1, c2) => c1.ports[""][0].connectTo(c2.ports[""][0])!,
        GetPort: (c) => c.ports[""][0],
    }];
}
