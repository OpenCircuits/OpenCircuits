import {CircuitInternal, GUID, uuid} from "shared/api/circuit/internal";
import {CircuitLog}            from "shared/api/circuit/internal/impl/CircuitLog";
import {CircuitDocument}       from "shared/api/circuit/internal/impl/CircuitDocument";

import {DefaultRenderOptions} from "shared/api/circuit/internal/assembly/RenderOptions";
import {Circuit} from "shared/api/circuit/public";
import {CircuitContext, CircuitTypes} from "shared/api/circuit/public/impl/CircuitContext";
import {AnalogObjInfoProvider} from "../internal/AnalogComponents";
import {MakeAnalogCircuitAssembler} from "../internal/assembly/AnalogCircuitAssembler";
import {AnalogComponentImpl} from "./impl/AnalogComponent";
import {AnalogWireImpl} from "./impl/AnalogWire";
import {AnalogPortImpl} from "./impl/AnalogPort";
import {IntegratedCircuitImpl} from "shared/api/circuit/public/impl/Circuit";
import {ComponentInfoImpl} from "shared/api/circuit/public/impl/ComponentInfo";
import {ObjContainerImpl} from "shared/api/circuit/public/impl/ObjContainer";
import {AnalogCircuitImpl} from "./impl/AnalogCircuit";
import {SelectionsImpl} from "shared/api/circuit/public/impl/Selections";


export function CreateCircuit(mainCircuitID = uuid()): [Circuit, CircuitContext<CircuitTypes>] {
    const log = new CircuitLog();
    const doc = new CircuitDocument(mainCircuitID, new AnalogObjInfoProvider(), log);
    const internal = new CircuitInternal(log, doc);

    const renderOptions = new DefaultRenderOptions();
    const assembler = MakeAnalogCircuitAssembler(internal, renderOptions);

    // Cache-logic for API-wrapper-types for efficiency reasons
    const newCache = () => ({
        comps: new Map<GUID, AnalogComponentImpl>(),
        wires: new Map<GUID, AnalogWireImpl>(),
        ports: new Map<GUID, AnalogPortImpl>(),
    });
    const mainCache = {
        ...newCache(),
        ics:       new Map<GUID, IntegratedCircuitImpl<CircuitTypes>>(),
        compInfos: new Map<GUID, ComponentInfoImpl<CircuitTypes>>(),
    };
    const icCaches = new Map<GUID, ReturnType<typeof newCache>>();
    const getCache = (icId?: GUID) => (icId ? icCaches.getOrInsert(icId, newCache) : mainCache);

    const ctx: CircuitContext<CircuitTypes> = {
        internal, assembler, renderOptions,

        constructComponent(id, icId) {
            return getCache(icId).comps.getOrInsert(id, (id) => new AnalogComponentImpl(state, id, icId));
        },
        constructWire(id, icId) {
            return getCache(icId).wires.getOrInsert(id, (id) => new AnalogWireImpl(state, id, icId));
        },
        constructPort(id, icId) {
            return getCache(icId).ports.getOrInsert(id, (id) => new AnalogPortImpl(state, id, icId));
        },
        constructIC(id) {
            return mainCache.ics.getOrInsert(id, (id) => new IntegratedCircuitImpl<CircuitTypes>(state, id));
        },
        constructComponentInfo(kind) {
            return mainCache.compInfos.getOrInsert(kind, (kind) => new ComponentInfoImpl<CircuitTypes>(state, kind));
        },
        constructObjContainer(objs, icId) {
            return new ObjContainerImpl(state, objs, icId);
        },
    }

    const circuit = new AnalogCircuitImpl(state, new SelectionsImpl(state));

    return [circuit, state];
}
