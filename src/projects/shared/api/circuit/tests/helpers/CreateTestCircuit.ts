import "./Extensions";

import {V, Vector} from "Vector";

import {ErrE, OkVoid, Result} from "shared/api/circuit/utils/Result";

import {Schema} from "shared/api/circuit/schema";

import {Circuit, Component, Node, Port, ReadonlyICPin, Wire, uuid} from "shared/api/circuit/public";
import {CircuitImpl, IntegratedCircuitImpl}      from "shared/api/circuit/public/impl/Circuit";
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
import {BaseComponentConfigurationInfo, BaseObjInfo,
        BaseObjInfoProvider, PortConfig} from "shared/api/circuit/internal/impl/ObjInfo";
import {ComponentAssembler} from "shared/api/circuit/internal/assembly/ComponentAssembler";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {MapObj} from "shared/api/circuit/utils/Functions";
import {ICComponentAssembler} from "shared/api/circuit/internal/assembly/ICComponentAssembler";
import {SelectionsImpl} from "shared/api/circuit/public/impl/Selections";
import {ObjContainerImpl} from "shared/api/circuit/public/impl/ObjContainer";


// TestCircuit is a circuit with the following specifications:
// Components:
//  TestComp
//    Only 1 Port Configuration - { "": 1 }
//    The component is a 1x1 Rectangle with a single port pointing to the right 0.5 units away
//     i.e, if the component is (0, 0), it's right edge is at (0.5, 0) and the port target is at (1, 0).
//  TestNode
//    Only 1 Port Configuration - { "": 1 }
//    The component is a default Node, a 1x1 circle a single port inside it.
// Wires:
//  TestWire
//    Can connect any port to any other port.
// Ports:
//  TestPort

export class TestComponentInfo extends BaseComponentConfigurationInfo {
    protected override getPortInfo(_p: PortConfig, _group: string, _i: number): Pick<Schema.Port, "kind" | "props"> {
        return {
            kind:  "TestPort",
            props: {},
        };
    }
    public override isPortAvailable(_port: Schema.Port, _curConnections: Schema.Port[]): boolean {
        return true;
    }
    public override checkPortConnectivity(
        _port: Schema.Port,
        _newConnection: Schema.Port,
        _curConnections: Schema.Port[],
    ): Result {
        return OkVoid();
    }
}

export class TestObjInfoProvider extends BaseObjInfoProvider {
    public constructor(portConfigs: PortConfig[]) {
        super(
            [
                new TestComponentInfo("TestComp", {}, [""], portConfigs, false),
                new TestComponentInfo("TestNode", {}, [""], portConfigs, true),

                new TestComponentInfo("Pin", {}, [""], portConfigs, false),
            ],
            [new BaseObjInfo("Wire", "TestWire", { "color": "string" })],
            [new BaseObjInfo("Port", "TestPort", {})],
        );
    }

    public override createIC(ic: Schema.IntegratedCircuit): void {
        const ports = ic.metadata.pins.reduce<Record<string, Schema.IntegratedCircuitPin[]>>((prev, pin) => ({
            ...prev,
            [pin.group]: [...(prev[pin.group] ?? []), pin],
        }), {});
        const portConfig: PortConfig = MapObj(ports, ([_, pins]) => pins.length);

        this.ics.set(ic.metadata.id, new TestComponentInfo(ic.metadata.id, {}, [""], [portConfig], false));
    }

    public override deleteIC(ic: Schema.IntegratedCircuit): void {
        this.ics.delete(ic.metadata.id);
    }
}

export class TestComponentAssembler extends ComponentAssembler {
    public constructor(params: AssemblerParams) {
        super(params,  {
            "": () => ({ origin: V(0, 0), target: V(1, 0) }),
        }, [
            { // Line
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.PortsChanged]),
                assemble:     (comp) => ({
                    kind:      "Rectangle",
                    transform: this.getTransform(comp),
                }),

                styleChangesWhenSelected: true,

                getStyle: (comp) => this.options.fillStyle(this.isSelected(comp.id)),
            },
        ]);
    }

    protected override getSize(_comp: Schema.Component): Vector {
        return V(1, 1);
    }
}

export class TestComponentImpl extends ComponentImpl<CircuitTypes> {}

export class TestWireImpl extends WireImpl<CircuitTypes> {
    protected override getNodeKind(): string {
        return "TestNode";
    }

    protected override connectNode(node: Node, p1: Port, p2: Port) {
        const port = node.ports[""][0];
        return {
            wire1: p1.connectTo(port),
            wire2: port.connectTo(p2),
        };
    }
}


export class TestPortImpl extends PortImpl<CircuitTypes> {
    protected override getWireKind(_p1: GUID, _p2: GUID): string {
        return "TestWire";
    }
}

export class TestCircuitImpl extends CircuitImpl<CircuitTypes> {
    protected override checkIfPinIsValid(_pin: ReadonlyICPin, port: Port): Result {
        if (port.parent.kind !== "Pin")
            return ErrE(`TestCircuit.checkIfPinIsValid: Pin must be apart of a 'Pin' component! Found: '${port.parent.kind}' instead!`);
        return OkVoid();
    }
}

export interface TestCircuitHelpers {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    PlaceAt(...positions: Vector[]): Component[];
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Connect(c1: Component, c2: Component): Wire;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    GetPort(c: Component): Port;
}

export function CreateTestCircuit(
    additionalPortConfigs: PortConfig[] = []
): [Circuit, CircuitState<CircuitTypes>, TestCircuitHelpers] {
    const portConfigs = [{ "": 1 }, ...additionalPortConfigs];

    const mainCircuitID = uuid();
    const log = new CircuitLog();
    const doc = new CircuitDocument(mainCircuitID, new TestObjInfoProvider(portConfigs), log);
    const internal = new CircuitInternal(log, doc);

    const renderOptions = new DefaultRenderOptions();
    const assembler = new CircuitAssembler(internal, renderOptions, (params) => ({
        "IC":       new ICComponentAssembler(params),
        "TestWire": new WireAssembler(params),
        "TestComp": new TestComponentAssembler(params),
        "TestNode": new NodeAssembler(params, { "": () => ({ origin: V(0, 0), target: V(0, 0) }) }),

        "Pin": new NodeAssembler(params, { "": () => ({ origin: V(0, 0), target: V(0, 0) }) }),
    }));

    const state: CircuitState<CircuitTypes> = {
        internal, assembler, renderOptions,

        constructComponent(id, icId) {
            return new TestComponentImpl(state, id, icId);
        },
        constructWire(id, icId) {
            return new TestWireImpl(state, id, icId);
        },
        constructPort(id, icId) {
            return new TestPortImpl(state, id, icId);
        },
        constructIC(id) {
            return new IntegratedCircuitImpl(state, id);
        },
        constructComponentInfo(kind) {
            return new ComponentInfoImpl(state, kind);
        },
        constructObjContainer(objs, icId) {
            return new ObjContainerImpl(state, objs, icId);
        },
    };

    const circuit = new TestCircuitImpl(state, new SelectionsImpl<CircuitTypes>(state));

    return [circuit, state, {
        PlaceAt: (...positions) => positions.map((p) => circuit.placeComponentAt("TestComp", p)),
        Connect: (c1, c2) => c1.ports[""][0].connectTo(c2.ports[""][0])!,
        GetPort: (c) => c.ports[""][0],
    }];
}
