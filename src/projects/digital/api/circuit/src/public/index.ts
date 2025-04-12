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
import {DigitalSimRunner} from "../internal/sim/DigitalSimRunner";


export * from "./DigitalCircuit";

export function CreateCircuit(): [DigitalCircuit, DigitalCircuitState] {
    const mainCircuitID = uuid();
    const log = new CircuitLog();
    const doc = new CircuitDocument(mainCircuitID, new DigitalObjInfoProvider(), log);
    const internal = new CircuitInternal(log, doc);

    const renderOptions = new DefaultRenderOptions();
    const sim = new DigitalSim(internal, DigitalPropagators);
    const simRunner = new DigitalSimRunner(sim);
    const assembler = MakeDigitalCircuitAssembler(internal, sim, renderOptions);

    const cache = {
        comps:     new Map<GUID, DigitalComponentImpl>(),
        wires:     new Map<GUID, DigitalWireImpl>(),
        ports:     new Map<GUID, DigitalPortImpl>(),
        ics:       new Map<GUID, DigitalIntegratedCircuitImpl>(),
        compInfos: new Map<GUID, DigitalComponentInfoImpl>(),
    }

    const state: DigitalCircuitState = {
        internal, assembler, sim, simRunner, renderOptions,

        constructComponent(id) {
            return cache.comps.getOrInsert(id, (id) => new DigitalComponentImpl(state, id));
        },
        constructWire(id) {
            return cache.wires.getOrInsert(id, (id) => new DigitalWireImpl(state, id));
        },
        constructPort(id) {
            return cache.ports.getOrInsert(id, (id) => new DigitalPortImpl(state, id));
        },
        constructIC(id) {
            return cache.ics.getOrInsert(id, (id) => new DigitalIntegratedCircuitImpl(state, id));
        },
        constructComponentInfo(kind) {
            return cache.compInfos.getOrInsert(kind, (kind) => new DigitalComponentInfoImpl(state, kind));
        },
    }

    const circuit = new DigitalCircuitImpl(state);

    return [circuit, state];
}
