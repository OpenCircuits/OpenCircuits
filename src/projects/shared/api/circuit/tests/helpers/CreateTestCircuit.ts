import "./Extensions";

import {V, Vector} from "Vector";

import {Ok, OkVoid, Result} from "shared/api/circuit/utils/Result";

import {Schema} from "shared/api/circuit/schema";

import {Circuit, Component, Port, Wire, uuid} from "shared/api/circuit/public";
import {CircuitImpl}      from "shared/api/circuit/public/impl/Circuit";
import {CachedCircuitAPIFactoryImpl, CircuitAPIFactory, CircuitContext, CircuitTypes}             from "shared/api/circuit/public/impl/CircuitContext";
import {ComponentImpl}                               from "shared/api/circuit/public/impl/Component";
import {ComponentInfoImpl}                           from "shared/api/circuit/public/impl/ComponentInfo";
import {PortImpl}                                    from "shared/api/circuit/public/impl/Port";
import {WireImpl}                                    from "shared/api/circuit/public/impl/Wire";

import {GUID}             from "shared/api/circuit/internal";
import {CircuitAssembler} from "shared/api/circuit/internal/assembly/CircuitAssembler";
import {NodeAssembler}    from "shared/api/circuit/internal/assembly/common/NodeAssembler";
import {WireAssembler}    from "shared/api/circuit/internal/assembly/WireAssembler";
import {BaseComponentConfigurationInfo,
        BaseObjInfoProvider, BasePortConfigurationInfo, BaseWireConfigurationInfo, PortConfig} from "shared/api/circuit/internal/impl/ObjInfo";
import {ComponentAssembler} from "shared/api/circuit/internal/assembly/ComponentAssembler";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {MapObj} from "shared/api/circuit/utils/Functions";
import {ICComponentAssembler} from "shared/api/circuit/internal/assembly/common/ICComponentAssembler";
import {SelectionsImpl} from "shared/api/circuit/public/impl/Selections";
import {ObjContainerImpl} from "shared/api/circuit/public/impl/ObjContainer";
import {IntegratedCircuitImpl} from "shared/api/circuit/public/impl/IntegratedCircuit";


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

export class TestWireInfo extends BaseWireConfigurationInfo {
    public override getSplitConnections(_p1: Schema.Port, _p2: Schema.Port, _wire: Schema.Wire): Result<{
        nodeKind: string;
        p1Group: string;
        p1Idx: number;
        p2Group: string;
        p2Idx: number;
    }> {
        return Ok({
            nodeKind: "TestNode",
            p1Group:  "",
            p1Idx:    0,
            p2Group:  "",
            p2Idx:    0,
        });
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
            [new TestWireInfo("TestWire", {})],
            [new BasePortConfigurationInfo("TestPort", {}, "TestWire")],
            ["Pin"],
        );
    }

    public override createIC(ic: Schema.IntegratedCircuit): void {
        const ports = ic.metadata.pins.reduce<Record<string, Schema.IntegratedCircuitPin[]>>((prev, pin) => ({
            ...prev,
            [pin.group]: [...(prev[pin.group] ?? []), pin],
        }), {});
        const portConfig: PortConfig = MapObj(ports, ([_, pins]) => pins.length);

        this.ics.set(ic.metadata.id, new TestComponentInfo(
            ic.metadata.id,
            {},
            Object.keys(ports),
            [portConfig],
            false,
            MapObj(ports, ([_, pins]) => pins.map((p) => p.name)),
        ));
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

export class TestCircuitContext extends CircuitContext<CircuitTypes> {
    public readonly assembler: CircuitAssembler;
    public readonly factory: CircuitAPIFactory<CircuitTypes>;

    public constructor(id: GUID, additionalPortConfigs: PortConfig[] = []) {
        super(id, new TestObjInfoProvider([{ "": 1 }, ...additionalPortConfigs]));

        this.assembler = new CircuitAssembler(this.internal, this.renderOptions, (params) => ({
            "IC":       new ICComponentAssembler(params),
            "TestWire": new WireAssembler(params),
            "TestComp": new TestComponentAssembler(params),
            "TestNode": new NodeAssembler(params, { "": () => ({ origin: V(0, 0), target: V(0, 0) }) }),

            "Pin": new NodeAssembler(params, { "": () => ({ origin: V(0, 0), target: V(0, 0) }) }),
        }));
        this.factory = new CachedCircuitAPIFactoryImpl({
            constructComponent: (id, icId) => new ComponentImpl(this, id, icId),
            constructWire:      (id, icId) => new WireImpl(this, id, icId),
            constructPort:      (id, icId) => new PortImpl(this, id, icId),

            constructIC: (id) => new IntegratedCircuitImpl(this, id),

            constructComponentInfo: (kind) => new ComponentInfoImpl(this, kind),

            constructObjContainer: (objs, icId) => new ObjContainerImpl(this, objs, icId),
        });
    }
}

export class TestCircuitImpl extends CircuitImpl<CircuitTypes> {
    public constructor(id: GUID, additionalPortConfigs: PortConfig[] = []) {
        const ctx = new TestCircuitContext(id, additionalPortConfigs);
        super(ctx, new SelectionsImpl(ctx));
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

export function CreateTestCircuitHelpers(circuit: Circuit): TestCircuitHelpers {
    return {
        PlaceAt: (...positions) => positions.map((p) => circuit.placeComponentAt("TestComp", p)),
        Connect: (c1, c2) => c1.ports[""][0].connectTo(c2.ports[""][0])!,
        GetPort: (c) => c.ports[""][0],
    };
}

export function CreateTestCircuit(
    additionalPortConfigs: PortConfig[] = []
): [Circuit, TestCircuitHelpers] {
    const circuit = new TestCircuitImpl(uuid(), additionalPortConfigs);
    return [circuit, CreateTestCircuitHelpers(circuit)];
}
