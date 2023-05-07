import {CircuitInternal}   from "core/internal";
import {CircuitLog}        from "core/internal/impl/CircuitLog";
import {CircuitDocument}   from "core/internal/impl/CircuitDocument";
import {SelectionsManager} from "core/internal/impl/SelectionsManager";

import {CreateDigitalComponentInfoProvider} from "digital/internal/DigitalComponents";
import {DigitalCircuitView}                 from "digital/internal/views/DigitalCircuitView";
import {DigitalSim}                         from "digital/internal/sim/DigitalSim";

import {DigitalCircuit} from "./api/DigitalCircuit";

import {DigitalCircuitImpl}   from "./api/impl/DigitalCircuit";
import {DigitalComponentImpl} from "./api/impl/DigitalComponent";
import {DigitalWireImpl}      from "./api/impl/DigitalWire";
import {DigitalPortImpl}      from "./api/impl/DigitalPort";
import {DigitalCircuitState}  from "./api/impl/DigitalCircuitState";


export * from "./api/DigitalCircuit";

export function CreateCircuit(): DigitalCircuit {
    const internal = new CircuitInternal(
        new CircuitLog(),
        new CircuitDocument(CreateDigitalComponentInfoProvider())
    );
    const selectionsManager = new SelectionsManager();
    const sim = new DigitalSim(internal);
    const view = new DigitalCircuitView(internal, selectionsManager, sim);

    const state: DigitalCircuitState = {
        internal, view, selectionsManager, sim,
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
        constructObj(id) {
            if (internal.doc.hasComp(id))
                return DigitalComponentImpl(circuit, state, id);
            else if (internal.doc.hasWire(id))
                return DigitalWireImpl(circuit, state, id);
            else if (internal.doc.hasPort(id))
                return DigitalPortImpl(circuit, state, id);
            throw new Error(`Cannot construct object with id ${id}!`);
        },
    }
    const circuit = DigitalCircuitImpl(state);

    return circuit;
}

export function ParseCircuit(rawContents: string): DigitalCircuit {
    throw new Error("Unimplemented");
}
