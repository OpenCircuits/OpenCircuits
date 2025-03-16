import "./Extensions";

import {V, Vector} from "Vector";

import {OkVoid, Result} from "shared/api/circuit/utils/Result";

import {Schema} from "shared/api/circuit/schema";

import {Component, Node, Port, Circuit, Wire, uuid} from "shared/api/circuit/public";
import {IntegratedCircuitImpl, CircuitImpl}      from "shared/api/circuit/public/impl/Circuit";
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
import {ICComponentAssembler} from "shared/api/circuit/internal/assembly/ICComponentAssembler";


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

export class TestComponentAssembler extends ComponentAssembler {
    public constructor(params: AssemblerParams) {
        super(params, V(1, 1),  {
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

    const log = new CircuitLog();
    const doc = new CircuitDocument(new BaseObjInfoProvider(
        [
            new TestComponentInfo("TestComp", {}, [""], portConfigs, false),
            new TestComponentInfo("TestNode", {}, [""], portConfigs, true),

            new TestComponentInfo("Pin", {}, [""], portConfigs, false),
        ],
        [new BaseObjInfo("Wire", "TestWire", { "color": "string" })],
        [new BaseObjInfo("Port", "TestPort", {})],
    ), log);

    const mainCircuitID = uuid();
    doc.createCircuit(mainCircuitID);

    const internal = new CircuitInternal(mainCircuitID, log, doc);
    const icInternals: Record<GUID, CircuitInternal> = {};

    const renderOptions = new DefaultRenderOptions();
    const assembler = new CircuitAssembler(internal, renderOptions, (params) => ({
        "TestWire": new WireAssembler(params),
        "TestComp": new TestComponentAssembler(params),
        "TestNode": new NodeAssembler(params, { "": () => ({ origin: V(0, 0), target: V(0, 0) }) }),

        "Pin": new NodeAssembler(params, { "": () => ({ origin: V(0, 0), target: V(0, 0) }) }),
    }));

    const state: CircuitState<CircuitTypes> = {
        internal, assembler, renderOptions,

        constructComponent(id) {
            return new TestComponentImpl(state, id);
        },
        constructWire(id) {
            return new TestWireImpl(state, id);
        },
        constructPort(id) {
            return new TestPortImpl(state, id);
        },
        constructIC(id) {
            return new IntegratedCircuitImpl(icInternals[id]);
        },
        constructComponentInfo(kind) {
            return new ComponentInfoImpl(state, kind);
        },
    };

    const circuit = new CircuitImpl(state, doc, (id, objs, metadata, portConfig, portFactory) => {
        const kind = id;

        doc.createIC(
            metadata,
            new TestComponentInfo(kind, {}, [""], [portConfig], false),
            objs,
        );

        icInternals[id] = new CircuitInternal(id, log, doc);

        // TODO[leon] ----- THIS WILL ONLY LET ICS BE PUT IN MAIN CIRCUIT!!!! TODO TODO TODO
        state.assembler.addAssembler(kind, (params) =>
            new ICComponentAssembler(params, V(metadata.displayWidth, metadata.displayHeight), portFactory));
    });

    return [circuit, state, {
        PlaceAt: (...positions) => positions.map((p) => circuit.placeComponentAt("TestComp", p)),
        Connect: (c1, c2) => c1.ports[""][0].connectTo(c2.ports[""][0])!,
        GetPort: (c) => c.ports[""][0],
    }];
}
