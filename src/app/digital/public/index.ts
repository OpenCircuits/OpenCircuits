import {CircuitInternal}   from "core/internal";
import {CircuitLog}        from "core/internal/impl/CircuitLog";
import {CircuitDocument}   from "core/internal/impl/CircuitDocument";
import {SelectionsManager} from "core/internal/impl/SelectionsManager";

import {CreateDigitalComponentInfoProvider} from "digital/internal/DigitalComponents";
import {DigitalCircuitAssembler}            from "digital/internal/assembly/DigitalCircuitAssembler";
import {DigitalSim}                         from "digital/internal/sim/DigitalSim";

import {DigitalCircuit} from "./api/DigitalCircuit";

import {DigitalCircuitImpl}   from "./api/impl/DigitalCircuit";
import {DigitalComponentImpl} from "./api/impl/DigitalComponent";
import {DigitalWireImpl}      from "./api/impl/DigitalWire";
import {DigitalPortImpl}      from "./api/impl/DigitalPort";
import {DigitalCircuitState}  from "./api/impl/DigitalCircuitState";


export * from "./api/DigitalCircuit";

export function CreateCircuit(): [DigitalCircuit, DigitalCircuitState] {
    const internal = new CircuitInternal(
        new CircuitLog(),
        new CircuitDocument(CreateDigitalComponentInfoProvider())
    );
    const selectionsManager = new SelectionsManager();
    const sim = new DigitalSim(internal);
    const assembler = new DigitalCircuitAssembler(internal, selectionsManager, sim);

    const state: DigitalCircuitState = {
        internal, assembler, selectionsManager, sim,
        isLocked: false,

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
    const circuit = DigitalCircuitImpl(state);

    return [circuit, state];
}

export function ParseCircuit(rawContents: string): DigitalCircuit {
    throw new Error("Unimplemented");
}
