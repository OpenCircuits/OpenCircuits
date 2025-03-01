import {CircuitInternal, uuid} from "shared/api/circuit/internal";
import {CircuitLog}            from "shared/api/circuit/internal/impl/CircuitLog";
import {CircuitDocument}       from "shared/api/circuit/internal/impl/CircuitDocument";

import {DefaultRenderOptions} from "shared/api/circuit/internal/assembly/RenderOptions";

import {CreateDigitalComponentInfoProvider} from "digital/api/circuit/internal/DigitalComponents";
import {MakeDigitalCircuitAssembler}        from "digital/api/circuit/internal/assembly/DigitalCircuitAssembler";
import {DigitalSim}                         from "digital/api/circuit/internal/sim/DigitalSim";

import {DigitalCircuit, DigitalRootCircuit} from "./DigitalCircuit";

import {DigitalRootCircuitImpl} from "./impl/DigitalCircuit";
import {DigitalComponentImpl}   from "./impl/DigitalComponent";
import {DigitalWireImpl}        from "./impl/DigitalWire";
import {DigitalPortImpl}        from "./impl/DigitalPort";
import {DigitalCircuitState}    from "./impl/DigitalCircuitState";


export * from "./DigitalCircuit";

export function CreateCircuit(): [DigitalRootCircuit, DigitalCircuitState] {
    const log = new CircuitLog();
    const doc = new CircuitDocument(CreateDigitalComponentInfoProvider(), log);
    const internal = new CircuitInternal(uuid(), log, doc);

    const renderOptions = new DefaultRenderOptions();
    const sim = new DigitalSim(internal);
    const assembler = MakeDigitalCircuitAssembler(internal, sim, renderOptions);

    const state: DigitalCircuitState = {
        internal, assembler, sim, renderOptions,

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

export function ParseCircuit(_: string): DigitalCircuit {
    throw new Error("ParseCircuit: Unimplemented");
}
