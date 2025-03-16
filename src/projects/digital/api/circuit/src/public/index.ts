import {V} from "Vector";

import {CircuitInternal, GUID, uuid} from "shared/api/circuit/internal";
import {CircuitLog}            from "shared/api/circuit/internal/impl/CircuitLog";
import {CircuitDocument}       from "shared/api/circuit/internal/impl/CircuitDocument";

import {ICComponentAssembler} from "shared/api/circuit/internal/assembly/ICComponentAssembler";
import {DefaultRenderOptions} from "shared/api/circuit/internal/assembly/RenderOptions";

import {CreateDigitalComponentInfoProvider,
        DigitalComponentConfigurationInfo} from "digital/api/circuit/internal/DigitalComponents";
import {MakeDigitalCircuitAssembler}        from "digital/api/circuit/internal/assembly/DigitalCircuitAssembler";
import {DigitalSim}                         from "digital/api/circuit/internal/sim/DigitalSim";

import {DigitalCircuit} from "./DigitalCircuit";

import {DigitalIntegratedCircuitImpl, DigitalCircuitImpl} from "./impl/DigitalCircuit";
import {DigitalComponentImpl}   from "./impl/DigitalComponent";
import {DigitalWireImpl}        from "./impl/DigitalWire";
import {DigitalPortImpl}        from "./impl/DigitalPort";
import {DigitalCircuitState}    from "./impl/DigitalCircuitState";
import {DigitalComponentInfoImpl} from "./impl/DigitalComponentInfo";
import {DigitalPropagators} from "../internal/sim/DigitalPropagators";
import {DigitalSimRunner} from "../internal/sim/DigitalSimRunner";


export * from "./DigitalCircuit";

export function CreateCircuit(): [DigitalCircuit, DigitalCircuitState] {
    const log = new CircuitLog();
    const doc = new CircuitDocument(CreateDigitalComponentInfoProvider(), log);

    const mainCircuitID = uuid();
    doc.createCircuit(mainCircuitID);

    const internal = new CircuitInternal(mainCircuitID, log, doc);
    const icInternals: Record<GUID, CircuitInternal> = {};

    const renderOptions = new DefaultRenderOptions();
    const sim = new DigitalSim(internal, DigitalPropagators);
    const simRunner = new DigitalSimRunner(sim);
    const assembler = MakeDigitalCircuitAssembler(internal, sim, renderOptions);

    const state: DigitalCircuitState = {
        internal, assembler, sim, simRunner, renderOptions,

        constructComponent(id) {
            return new DigitalComponentImpl(state, id);
        },
        constructWire(id) {
            return new DigitalWireImpl(state, id);
        },
        constructPort(id) {
            return new DigitalPortImpl(state, id);
        },
        constructIC(id) {
            return new DigitalIntegratedCircuitImpl(icInternals[id]);
        },
        constructComponentInfo(kind) {
            return new DigitalComponentInfoImpl(state, kind);
        },
    }

    const circuit = new DigitalCircuitImpl(state, doc, (id, objs, metadata, portConfig, portFactory) => {
        const kind = id;

        doc.createIC(
            metadata,
            new DigitalComponentConfigurationInfo(kind, {}, { "inputs": "input", "outputs": "output" }, [portConfig]),
            objs,
        );

        icInternals[id] = new CircuitInternal(id, log, doc);

        state.assembler.addAssembler(kind, (params) =>
            new ICComponentAssembler(params, V(metadata.displayWidth, metadata.displayHeight), portFactory));

        state.sim.addPropagator(kind, (_obj, _signals, _state) => ({ outputs: {} }));
    });

    return [circuit, state];
}
