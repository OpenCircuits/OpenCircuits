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


export type CircuitAPITypes = {
    CircuitT: Circuit;
    ReadonlyCircuitT: ReadonlyCircuit;

    IntegratedCircuitT: IntegratedCircuit;
    ReadonlyIntegratedCircuitT: ReadonlyIntegratedCircuit;

    NodeT: Node;
    ReadonlyNodeT: ReadonlyNode;

    ComponentT: Component;
    ReadonlyComponentT: ReadonlyComponent;

    WireT: Wire;
    ReadonlyWireT: ReadonlyWire;

    PortT: Port;
    ReadonlyPortT: ReadonlyPort;

    ObjContainerT: ObjContainer;
    ReadonlyObjContainerT: ReadonlyObjContainer;

    SelectionsT: Selections;
    ReadonlySelectionsT: ReadonlySelections;

    ComponentInfoT: ComponentInfo;
    ICInfoT: ICInfo;
}

// Utility interface to hold utility types for the templated Circuit API.
export type CircuitTypes<Types extends CircuitAPITypes = CircuitAPITypes> = {
    "Circuit": Types["CircuitT"];
    "ReadonlyCircuit": Types["ReadonlyCircuitT"];

    "Component": Types["ComponentT"];
    "Node": Types["NodeT"];
    "Wire": Types["WireT"];
    "Port": Types["PortT"];
    "Obj": Types["ComponentT"] | Types["WireT"] | Types["PortT"];

    "ReadonlyComponent": Types["ReadonlyComponentT"];
    "ReadonlyNode": Types["ReadonlyNodeT"];
    "ReadonlyWire": Types["ReadonlyWireT"];
    "ReadonlyPort": Types["ReadonlyPortT"];
    "ReadonlyObj": Types["ReadonlyComponentT"] | Types["ReadonlyWireT"] | Types["ReadonlyPortT"];

    "Component[]": Array<Types["ComponentT"]>;
    "Wire[]": Array<Types["WireT"]>;
    "Port[]": Array<Types["PortT"]>;
    "Obj[]": Array<Types["ComponentT"] | Types["WireT"] | Types["PortT"]>;

    "ReadonlyComponent[]": Array<Types["ReadonlyComponentT"]>;
    "ReadonlyWire[]": Array<Types["ReadonlyWireT"]>;
    "ReadonlyPort[]": Array<Types["ReadonlyPortT"]>;
    "ReadonlyObj[]": Array<Types["ReadonlyComponentT"] | Types["ReadonlyWireT"] | Types["ReadonlyPortT"]>;

    "IC": Types["IntegratedCircuitT"];
    "ReadonlyIC": Types["ReadonlyIntegratedCircuitT"];
    "IC[]": Array<Types["IntegratedCircuitT"]>;
    "ReadonlyIC[]": Array<Types["ReadonlyIntegratedCircuitT"]>;

    "Path": Array<Types["NodeT"] | Types["WireT"]>;

    "ICInfo": Types["ICInfoT"];
    "ComponentInfo": Types["ComponentInfoT"];

    "ObjContainerT": Types["ObjContainerT"];
    "ReadonlyObjContainerT": Types["ReadonlyObjContainerT"];

    "SelectionsT": Types["SelectionsT"];
    "ReadonlySelectionsT": Types["ReadonlySelectionsT"];
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
