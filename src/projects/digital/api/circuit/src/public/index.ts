import {CircuitInternal}   from "shared/api/circuit/internal";
import {CircuitLog}        from "shared/api/circuit/internal/impl/CircuitLog";
import {CircuitDocument}   from "shared/api/circuit/internal/impl/CircuitDocument";
import {SelectionsManager} from "shared/api/circuit/internal/impl/SelectionsManager";

import {DefaultRenderOptions} from "shared/api/circuit/internal/assembly/RenderOptions";

import {CreateDigitalComponentInfoProvider} from "digital/api/circuit/internal/DigitalComponents";
import {DigitalCircuitAssembler}            from "digital/api/circuit/internal/assembly/DigitalCircuitAssembler";
import {DigitalSim}                         from "digital/api/circuit/internal/sim/DigitalSim";

import {DigitalCircuit, DigitalRootCircuit} from "./DigitalCircuit";

import {DigitalRootCircuitImpl}   from "./impl/DigitalCircuit";
import {DigitalComponentImpl} from "./impl/DigitalComponent";
import {DigitalWireImpl}      from "./impl/DigitalWire";
import {DigitalPortImpl}      from "./impl/DigitalPort";
import {DigitalCircuitState}  from "./impl/DigitalCircuitState";


export * from "./DigitalCircuit";

export function CreateCircuit(): [DigitalRootCircuit, DigitalCircuitState] {
    const log = new CircuitLog();
    const doc = new CircuitDocument(CreateDigitalComponentInfoProvider());
    const internal = new CircuitInternal(log, doc);

    const renderOptions = new DefaultRenderOptions();
    const selectionsManager = new SelectionsManager();
    const sim = new DigitalSim(internal);
    const assembler = new DigitalCircuitAssembler(internal, selectionsManager, sim, renderOptions);

    const state: DigitalCircuitState = {
        log, doc, internal, assembler, selectionsManager, sim, renderOptions,

        constructComponent(id) {
            return DigitalComponentImpl(circuit, state, id);
        },
        constructWire(id) {
            return DigitalWireImpl(circuit, state, id);
        },
        constructPort(id) {
            return DigitalPortImpl(circuit, state, id);
        },
    }
    const circuit = DigitalRootCircuitImpl(state);

    return [circuit, state];
}

export function ParseCircuit(rawContents: string): DigitalCircuit {
    throw new Error("Unimplemented");
}
