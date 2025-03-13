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

import {DigitalCircuit, DigitalRootCircuit} from "./DigitalCircuit";

import {DigitalIntegratedCircuitImpl, DigitalRootCircuitImpl} from "./impl/DigitalCircuit";
import {DigitalComponentImpl}   from "./impl/DigitalComponent";
import {DigitalWireImpl}        from "./impl/DigitalWire";
import {DigitalPortImpl}        from "./impl/DigitalPort";
import {DigitalCircuitState}    from "./impl/DigitalCircuitState";
import {DigitalComponentInfoImpl} from "./impl/DigitalComponentInfo";


export * from "./DigitalCircuit";

export function CreateCircuit(): [DigitalRootCircuit, DigitalCircuitState] {
    const log = new CircuitLog();
    const doc = new CircuitDocument(CreateDigitalComponentInfoProvider(), log);

    function MakeCircuitState(circuitID: GUID): DigitalCircuitState {
        const internal = new CircuitInternal(circuitID, log, doc);

        const renderOptions = new DefaultRenderOptions();
        const sim = new DigitalSim(internal);
        const assembler = MakeDigitalCircuitAssembler(internal, sim, renderOptions);

        const state: DigitalCircuitState = {
            internal, assembler, sim, renderOptions,

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
                return new DigitalIntegratedCircuitImpl(MakeCircuitState(id));
            },
            constructComponentInfo(kind) {
                return new DigitalComponentInfoImpl(state, kind);
            },
        }

        return state;
    }

    const mainCircuitID = uuid();
    doc.createCircuit(mainCircuitID);
    const mainState = MakeCircuitState(mainCircuitID);

    const circuit = new DigitalRootCircuitImpl(doc, mainState, (id, objs, metadata, portConfig, portFactory) => {
        const kind = id;

        doc.createIC(
            metadata,
            new DigitalComponentConfigurationInfo(kind, {}, { "inputs": "input", "outputs": "output" }, [portConfig]),
            objs,
        );

        // TODO[leon] ----- THIS WILL ONLY LET ICS BE PUT IN MAIN CIRCUIT!!!! TODO TODO TODO
        mainState.assembler.addAssembler(kind, (params) =>
            new ICComponentAssembler(params, V(metadata.displayWidth, metadata.displayHeight), portFactory));
    });

    return [circuit, mainState];
}

export function ParseCircuit(_: string): DigitalCircuit {
    throw new Error("ParseCircuit: Unimplemented");
}
