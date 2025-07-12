import {CircuitInternal, GUID}   from "shared/api/circuit/internal";
import {CircuitAssembler}  from "shared/api/circuit/internal/assembly/CircuitAssembler";
import {DefaultRenderOptions, RenderOptions}     from "shared/api/circuit/internal/assembly/RenderOptions";

import {Component, Node, ReadonlyComponent, ReadonlyNode}   from "../Component";
import {Port, ReadonlyPort}              from "../Port";
import {ReadonlyWire, Wire}              from "../Wire";
import {Circuit, ReadonlyCircuit} from "../Circuit";
import {ObjContainer, ReadonlyObjContainer} from "../ObjContainer";
import {ReadonlySelections, Selections} from "../Selections";
import {ObjInfoProvider} from "../../internal/impl/ObjInfo";
import {CircuitLog} from "../../internal/impl/CircuitLog";
import {CircuitDocument} from "../../internal/impl/CircuitDocument";
import {ComponentInfo} from "../ComponentInfo";
import {ICInfo, IntegratedCircuit, ReadonlyIntegratedCircuit} from "../IntegratedCircuit";


// Utility interface to hold utility types for the templated Circuit API.
export type CircuitTypes<
    CircuitT extends Circuit = Circuit,
    RCircuitT extends ReadonlyCircuit = ReadonlyCircuit,

    ComponentT extends Component = Component,
    RComponentT extends ReadonlyComponent = ReadonlyComponent,
    WireT extends Wire = Wire,
    RWireT extends ReadonlyWire = ReadonlyWire,
    PortT extends Port = Port,
    RPortT extends ReadonlyPort = ReadonlyPort,

    NodeT extends Node = Node,
    RNodeT extends ReadonlyNode = ReadonlyNode,

    ICT extends IntegratedCircuit = IntegratedCircuit,
    RICT extends ReadonlyIntegratedCircuit = ReadonlyIntegratedCircuit,

    ObjContainerT extends ObjContainer = ObjContainer,
    RObjContainerT extends ReadonlyObjContainer = ReadonlyObjContainer,

    SelectionsT extends Selections = Selections,
    RSelectionsT extends ReadonlySelections = ReadonlySelections,

    ICInfoT extends ICInfo = ICInfo,
    CompInfoT extends ComponentInfo = ComponentInfo,
> = {
    "Circuit": CircuitT;
    "ReadonlyCircuit": RCircuitT;

    "Component": ComponentT;
    "Node": NodeT;
    "Wire": WireT;
    "Port": PortT;
    "Obj": ComponentT | WireT | PortT;

    "ReadonlyComponent": RComponentT;
    "ReadonlyNode": RNodeT;
    "ReadonlyWire": RWireT;
    "ReadonlyPort": RPortT;
    "ReadonlyObj": RComponentT | RWireT | RPortT;

    "Component[]": ComponentT[];
    "Wire[]": WireT[];
    "Port[]": PortT[];
    "Obj[]": Array<ComponentT | WireT | PortT>;

    "ReadonlyComponent[]": RComponentT[];
    "ReadonlyWire[]": RWireT[];
    "ReadonlyPort[]": RPortT[];
    "ReadonlyObj[]": Array<RComponentT | RWireT | RPortT>;

    "IC": ICT;
    "RIC": RICT;
    "IC[]": ICT[];
    "ReadonlyIC[]": RICT[];

    "ComponentInfo": ComponentT["info"];

    "Path": Array<NodeT | WireT>;

    "ICInfo": ICInfoT;
    "CompInfo": CompInfoT;

    "ObjContainerT": ObjContainerT;
    "ReadonlyObjContainerT": RObjContainerT;

    "SelectionsT": SelectionsT;
    "ReadonlySelectionsT": RSelectionsT;
}


export interface CircuitAPIFactory<T extends CircuitTypes> {
    constructComponent(id: string, icId?: GUID): T["Component"];
    constructWire(id: string, icId?: GUID): T["Wire"];
    constructPort(id: string, icId?: GUID): T["Port"];
    constructIC(id: string): T["IC"];
    constructComponentInfo(kind: string): T["ComponentInfo"];
    constructObjContainer(objs: Set<GUID>, icId?: GUID): T["ObjContainerT"];
}

interface ObjsCache<T extends CircuitTypes> {
    comps: Map<GUID, T["Component"]>;
    wires: Map<GUID, T["Wire"]>;
    ports: Map<GUID, T["Port"]>;
}
export class CachedCircuitAPIFactoryImpl<T extends CircuitTypes> implements CircuitAPIFactory<T> {
    private readonly cache: ObjsCache<T> & {
        ics: Map<GUID, T["IC"]>;
        compInfos: Map<GUID, T["ComponentInfo"]>;

        icObjs: Map<GUID, ObjsCache<T>>;
    };

    private readonly factory: CircuitAPIFactory<T>;

    public constructor(factory: CircuitAPIFactory<T>) {
        this.cache = {
            comps:     new Map(),
            wires:     new Map(),
            ports:     new Map(),
            ics:       new Map(),
            compInfos: new Map(),
            icObjs:    new Map(),
        };
        this.factory = factory;
    }

    protected getCache(icId?: GUID): ObjsCache<T> {
        if (icId)
            return this.cache.icObjs.getOrInsert(icId, () => ({ comps: new Map(), wires: new Map(), ports: new Map() }));
        return this.cache;
    }

    public constructComponent(id: string, icId?: GUID): T["Component"] {
        return this.getCache(icId).comps.getOrInsert(id, (id) => this.factory.constructComponent(id, icId))
    }
    public constructWire(id: string, icId?: GUID): T["Wire"] {
        return this.getCache(icId).wires.getOrInsert(id, (id) => this.factory.constructWire(id, icId))
    }
    public constructPort(id: string, icId?: GUID): T["Port"] {
        return this.getCache(icId).ports.getOrInsert(id, (id) => this.factory.constructPort(id, icId))
    }

    public constructIC(id: string): T["IC"] {
        return this.cache.ics.getOrInsert(id, (id) => this.factory.constructIC(id))
    }
    public constructComponentInfo(kind: string): T["ComponentInfo"] {
        return this.cache.compInfos.getOrInsert(kind, (kind) => this.factory.constructComponentInfo(kind))
    }

    public constructObjContainer(objs: Set<GUID>, icId?: GUID): T["ObjContainerT"] {
        return this.factory.constructObjContainer(objs, icId);
    }
}

// CircuitContext is an object used to hold the underlying internal Circuit implementation
// along with utility methods for all the API object types. This object is meant to be passed
// between API objects so they all have access to the internal circuit and can construct eachother.
// It should be owned by the main CircuitImpl.
export abstract class CircuitContext<T extends CircuitTypes> {
    public readonly internal: CircuitInternal;

    // TODO: Remove this, only Viewport references it
    // -> find options that can be extracted and put in separately that relate to rendering rather than assembly
    public readonly renderOptions: RenderOptions;

    // Sub-class must provide these properties, since they are project-specific.
    public abstract readonly assembler: CircuitAssembler;
    public abstract readonly factory: CircuitAPIFactory<T>;

    public constructor(id: GUID, objInfoProvider: ObjInfoProvider) {
        this.internal = new CircuitInternal(
            new CircuitDocument(id, objInfoProvider, new CircuitLog()));
        this.renderOptions = new DefaultRenderOptions();
    }
}
