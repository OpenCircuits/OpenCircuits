import {CircuitInternal, GUID, uuid} from "shared/api/circuit/internal";
import {CircuitLog}            from "shared/api/circuit/internal/impl/CircuitLog";
import {CircuitDocument}       from "shared/api/circuit/internal/impl/CircuitDocument";

import {DefaultRenderOptions} from "shared/api/circuit/internal/assembly/RenderOptions";

import {DigitalObjInfoProvider} from "digital/api/circuit/internal/DigitalComponents";
import {MakeDigitalCircuitAssembler}        from "digital/api/circuit/internal/assembly/DigitalCircuitAssembler";
import {DigitalSim}                         from "digital/api/circuit/internal/sim/DigitalSim";

import {DigitalCircuit} from "./DigitalCircuit";

import {DigitalCircuitImpl, DigitalIntegratedCircuitImpl} from "./impl/DigitalCircuit";
import {DigitalComponentImpl}   from "./impl/DigitalComponent";
import {DigitalWireImpl}        from "./impl/DigitalWire";
import {DigitalPortImpl}        from "./impl/DigitalPort";
import {DigitalCircuitState}    from "./impl/DigitalCircuitState";
import {DigitalComponentInfoImpl} from "./impl/DigitalComponentInfo";
import {DigitalPropagators} from "../internal/sim/DigitalPropagators";
import {DigitalObjContainerImpl} from "./impl/DigitalObjContainer";


export * from "./DigitalCircuit";
export * from "./DigitalComponent";
export * from "./DigitalComponentInfo";
export * from "./DigitalPort";
export * from "./DigitalWire";
export * from "./Utilities";

export function CreateCircuit(mainCircuitID = uuid()): [DigitalCircuit, DigitalCircuitState] {
    const log = new CircuitLog();
    const doc = new CircuitDocument(mainCircuitID, new DigitalObjInfoProvider(), log);
    const internal = new CircuitInternal(log, doc);

    const renderOptions = new DefaultRenderOptions();
    const sim = new DigitalSim(internal, DigitalPropagators);
    const assembler = MakeDigitalCircuitAssembler(internal, sim, renderOptions);

    // Cache-logic for API-wrapper-types for efficiency reasons
    const newCache = () => ({
        comps: new Map<GUID, DigitalComponentImpl>(),
        wires: new Map<GUID, DigitalWireImpl>(),
        ports: new Map<GUID, DigitalPortImpl>(),
    });
    const mainCache = {
        ...newCache(),
        ics:       new Map<GUID, DigitalIntegratedCircuitImpl>(),
        compInfos: new Map<GUID, DigitalComponentInfoImpl>(),
    };
    const icCaches = new Map<GUID, ReturnType<typeof newCache>>();
    const getCache = (icId?: GUID) => (icId ? icCaches.getOrInsert(icId, newCache) : mainCache);

    const state: DigitalCircuitState = {
        internal, assembler, sim, renderOptions,

        constructComponent(id, icId) {
            return getCache(icId).comps.getOrInsert(id, (id) => new DigitalComponentImpl(state, id, icId));
        },
        constructWire(id, icId) {
            return getCache(icId).wires.getOrInsert(id, (id) => new DigitalWireImpl(state, id, icId));
        },
        constructPort(id, icId) {
            return getCache(icId).ports.getOrInsert(id, (id) => new DigitalPortImpl(state, id, icId));
        },
        constructIC(id) {
            return mainCache.ics.getOrInsert(id, (id) => new DigitalIntegratedCircuitImpl(state, id));
        },
        constructComponentInfo(kind) {
            return mainCache.compInfos.getOrInsert(kind, (kind) => new DigitalComponentInfoImpl(state, kind));
        },
        constructObjContainer(objs, icId) {
            return new DigitalObjContainerImpl(state, objs, icId);
        },
    }

    const circuit = new DigitalCircuitImpl(state);

    return [circuit, state];
}
