import {CircuitInternal, GUID, uuid} from "shared/api/circuit/internal";
import {CircuitLog}            from "shared/api/circuit/internal/impl/CircuitLog";
import {CircuitDocument}       from "shared/api/circuit/internal/impl/CircuitDocument";

import {ICComponentAssembler} from "shared/api/circuit/internal/assembly/ICComponentAssembler";
import {DefaultRenderOptions} from "shared/api/circuit/internal/assembly/RenderOptions";

import {CreateDigitalComponentInfoProvider, DigitalComponentInfo} from "digital/api/circuit/internal/DigitalComponents";
import {MakeDigitalCircuitAssembler}        from "digital/api/circuit/internal/assembly/DigitalCircuitAssembler";
import {DigitalSim}                         from "digital/api/circuit/internal/sim/DigitalSim";

import {DigitalCircuit, DigitalRootCircuit} from "./DigitalCircuit";

import {DigitalIntegratedCircuitImpl, DigitalRootCircuitImpl} from "./impl/DigitalCircuit";
import {DigitalComponentImpl}   from "./impl/DigitalComponent";
import {DigitalWireImpl}        from "./impl/DigitalWire";
import {DigitalPortImpl}        from "./impl/DigitalPort";
import {DigitalCircuitState}    from "./impl/DigitalCircuitState";
import {Schema} from "shared/api/circuit/schema";
import {V, Vector} from "Vector";
import {PartialPortPos, PortFactory} from "shared/api/circuit/internal/assembly/PortAssembler";


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
                return DigitalComponentImpl(circuit, state, id);
            },
            constructWire(id) {
                return DigitalWireImpl(circuit, state, id);
            },
            constructPort(id) {
                return DigitalPortImpl(circuit, state, id);
            },
        }

        return state;
    }

    const mainCircuitID = uuid();
    doc.createCircuit(mainCircuitID);
    const mainState = MakeCircuitState(mainCircuitID);

    const circuit = DigitalRootCircuitImpl(mainState, (info) => {
        const id = uuid(), kind = id;

        const inputPorts = info.display.pins.filter(({ id }) => info.circuit.getPort(id)?.isInputPort);
        const outputPorts = info.display.pins.filter(({ id }) => info.circuit.getPort(id)?.isOutputPort);
        if (inputPorts.length + outputPorts.length !== info.display.pins.length)
            throw new Error(`Non input/output ports found in IC creation! ${info.display.pins}`);

        const portConfig = {
            // Switch the two since an internal Output pin corresponds to an input on the IC instance
            "inputs":  outputPorts.length,
            "outputs": inputPorts.length,
        };
        const metadata: Schema.IntegratedCircuit["metadata"] = {
            id:      id,  // Make a new ID
            name:    info.circuit.name,
            thumb:   info.circuit.thumbnail,
            desc:    info.circuit.desc,
            version: "v/0",

            displayWidth:  info.display.size.x,
            displayHeight: info.display.size.y,

            pins: info.display.pins.map(({ id, pos }) => ({ id, x: pos.x, y: pos.y })),
        }
        doc.createIC(
            metadata,
            new DigitalComponentInfo(kind, {}, { "inputs": "input", "outputs": "output" }, [portConfig]),
            info.circuit.getObjs().map((o) => o.toSchema()),
        );

        const makePortPos = (pos: Vector) => {
            const size = info.display.size;
            return {
                origin: V(pos.x, pos.y),

                dir: Math.abs(Math.abs(pos.x)-size.x/2) < Math.abs(Math.abs(pos.y)-size.y/2)
                    ? V(1, 0).scale(Math.sign(pos.x))
                    : V(0, 1).scale(Math.sign(pos.y)),
            } satisfies PartialPortPos;
        }

        const factory = {
            "inputs":  (index: number, _total: number) => makePortPos(outputPorts[index].pos),
            "outputs": (index: number, _total: number) => makePortPos(inputPorts[index].pos),
        } satisfies PortFactory;

        // TODO[leon] ----- THIS WILL ONLY LET ICS BE PUT IN MAIN CIRCUIT!!!! TODO TODO TODO
        mainState.assembler.addAssembler(kind, (params) =>
            new ICComponentAssembler(params, info.display.size, factory));

        return DigitalIntegratedCircuitImpl(id, MakeCircuitState(id));
    });

    return [circuit, mainState];
}

export function ParseCircuit(_: string): DigitalCircuit {
    throw new Error("ParseCircuit: Unimplemented");
}
