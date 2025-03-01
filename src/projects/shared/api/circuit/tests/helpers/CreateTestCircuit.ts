import "./Extensions";

import {V, Vector} from "Vector";

import {extend}         from "shared/api/circuit/utils/Functions";
import {OkVoid, Result} from "shared/api/circuit/utils/Result";

import {Schema} from "shared/api/circuit/schema";

import {Circuit, Component, Node, Port, RootCircuit, Wire, uuid} from "shared/api/circuit/public";
import {IntegratedCircuitImpl, RootCircuitImpl}                             from "shared/api/circuit/public/impl/Circuit";
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
import {ComponentAssembler} from "shared/api/circuit/internal/assembly/ComponentAssembler";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";


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

export class TestComponentAssembler extends ComponentAssembler {
    public constructor(params: AssemblerParams) {
        super(params, V(1, 1),  {
            "": () => ({ origin: V(0, 0), target: V(1, 0) }),
        }, [
            { // Line
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.PortsChanged]),
                assemble: (comp) => ({
                    kind:      "Rectangle",
                    transform: this.getTransform(comp),
                }),

                styleChangesWhenSelected: true,
                getStyle: (comp) => this.options.fillStyle(this.isSelected(comp.id)),
            },
        ]);
    }
}

export function TestComponentImpl(circuit: Circuit, state: CircuitState<CircuitTypes>, id: GUID) {
    const base = ComponentImpl(circuit, state, id);
    return extend(base, {
        get info() {
            return ComponentInfoImpl(state, base.kind);
        },
        isNode(): boolean {
            return (base.kind === "TestNode");
        },
    } as const) satisfies Component;
}

export function TestWireImpl(circuit: Circuit, state: CircuitState<CircuitTypes>, id: GUID) {
    return WireImpl(circuit, state, id, (p1, p2, pos) => {
        // Split logic
        const node = circuit.placeComponentAt("TestNode", pos) as Node;

        const port = node.ports[""][0];
        const wire1 = p1.connectTo(port);
        const wire2 = port.connectTo(p2);

        if (!wire1)
            throw new Error(`Failed to connect p1 to node! ${p1} -> ${node}`);
        if (!wire2)
            throw new Error(`Failed to connect p2 to node! ${p2} -> ${node}`);

        return { node, wire1, wire2 };
    });
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

export function CreateTestRootCircuit(
    additionalPortConfigs: PortConfig[] = []
): [RootCircuit, CircuitState<CircuitTypes>, TestRootCircuitHelpers] {
    const portConfigs = [{ "": 1 }, ...additionalPortConfigs];

    const log = new CircuitLog();
    const doc = new CircuitDocument(new BaseObjInfoProvider(
        [
            new TestComponentInfo("TestComp", {}, [""], portConfigs),
            new TestComponentInfo("TestNode", {}, [""], portConfigs),
        ],
        [new BaseObjInfo("Wire", "TestWire", { "color": "string" })],
        [new BaseObjInfo("Port", "TestPort", {})],
    ), log);
    const mainCircuitID = uuid();

    doc.createCircuit(mainCircuitID);
    const internal = new CircuitInternal(mainCircuitID, log, doc);

    const renderOptions = new DefaultRenderOptions();
    const assembler = new CircuitAssembler(internal, renderOptions, (params) => ({
        "TestWire": new WireAssembler(params),
        "TestComp": new TestComponentAssembler(params),
        "TestNode": new NodeAssembler(params, { "": () => ({ origin: V(0, 0), target: V(0, 0) }) }),
    }));

    const state: CircuitState<CircuitTypes> = {
        internal, assembler, renderOptions,

        constructComponent(id) {
            return TestComponentImpl(circuit, state, id);
        },
        constructWire(id) {
            return TestWireImpl(circuit, state, id);
        },
        constructPort(id) {
            return TestPortImpl(circuit, state, id);
        },

        // constructIC(id) {
        //     return IntegratedCircuitImpl(id, state);
        // },
    }
    const circuit = RootCircuitImpl(state);

    return [circuit, state, {
        PlaceAt: (...positions) => positions.map((p) => circuit.placeComponentAt("TestComp", p)),
        Connect: (c1, c2) => c1.ports[""][0].connectTo(c2.ports[""][0])!,
        GetPort: (c) => c.ports[""][0],
    }];
}
