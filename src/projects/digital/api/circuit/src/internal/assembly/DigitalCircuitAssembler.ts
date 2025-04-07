import {V} from "Vector";

import {CircuitInternal, GUID} from "shared/api/circuit/internal";

import {Schema} from "shared/api/circuit/schema";
import {MapObj} from "shared/api/circuit/utils/Functions";
import {Assembler, AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {CircuitAssembler} from "shared/api/circuit/internal/assembly/CircuitAssembler";
import {NodeAssembler}    from "shared/api/circuit/internal/assembly/NodeAssembler";
import {RenderOptions}    from "shared/api/circuit/internal/assembly/RenderOptions";
import {ICComponentAssembler} from "shared/api/circuit/internal/assembly/ICComponentAssembler";

import {DigitalSim}           from "../sim/DigitalSim";
import {DigitalWireAssembler} from "./DigitalWireAssembler";
import {ANDGateAssembler}     from "./components/gates/ANDGateAssembler";
import {ORGateAssembler}      from "./components/gates/ORGateAssembler";
import {LEDAssembler}         from "./components/LEDAssembler";
import {SwitchAssembler}      from "./components/SwitchAssembler";
import {ButtonAssembler}      from "./components/ButtonAssembler";
import {ClockAssembler}       from "./components/ClockAssembler";
import {ConstantHighAssembler} from "./components/ConstantHighAssembler";
import {ConstantLowAssembler} from "./components/ConstantLowAssembler";
import {ConstantNumberAssembler} from "./components/ConstantNumberAssembler";


export class DigitalCircuitAssembler extends CircuitAssembler {
    public constructor(
        circuit: CircuitInternal,
        options: RenderOptions,
        sim: DigitalSim,
        assemblers: (params: AssemblerParams) => Record<string, Assembler>,
    ) {
        super(circuit, options, assemblers);

        sim.subscribe((ev) => {
            if (ev.type === "queue") {
                const comps = ev.comps, inputPorts = ev.updatedInputPorts;
                comps.forEach((compId) =>
                    this.dirtyComponents.add(compId, AssemblyReason.StateUpdated));
                inputPorts.forEach((portId) => {
                    const port = circuit.getPortByID(portId).unwrap();
                    this.dirtyComponents.add(port.parent, AssemblyReason.SignalsChanged);
                });
            }
            if (ev.type === "step") {
                const inputPorts = ev.updatedInputPorts, outputPorts = ev.updatedOutputPorts;

                outputPorts.forEach((portId) => {
                    const wires = circuit.getWiresForPort(portId).unwrap();
                    wires.forEach((wireId) =>
                        this.dirtyWires.add(wireId, AssemblyReason.SignalsChanged));
                });
                inputPorts.forEach((portId) => {
                    const port = circuit.getPortByID(portId).unwrap();
                    this.dirtyComponents.add(port.parent, AssemblyReason.SignalsChanged);
                });
            }

            this.publish({ type: "onchange" });
        })
    }

    protected override createIC(icId: GUID): Assembler {
        const ic = this.circuit.getICInfo(icId).unwrap();

        const ports = ic.metadata.pins.reduce((prev, pin) => ({
            ...prev,
            [pin.group]: [...(prev[pin.group] ?? []), pin],
        }), {} as Record<string, Array<Schema.IntegratedCircuitMetadata["pins"][number]>>);

        const portFactory = MapObj(ports, ([_, ids]) =>
            (index: number, _total: number) => {
                const pos = V(ids[index].x, ids[index].y);
                const size = V(ic.metadata.displayWidth, ic.metadata.displayHeight);
                return {
                    origin: V(pos.x, pos.y),

                    dir: Math.abs(Math.abs(pos.x)-size.x/2) < Math.abs(Math.abs(pos.y)-size.y/2)
                        ? V(1, 0).scale(Math.sign(pos.x))
                        : V(0, 1).scale(Math.sign(pos.y)),
                };
            });

        return new ICComponentAssembler(
            { circuit: this.circuit, cache: this.cache, options: this.options },
            V(ic.metadata.displayWidth, ic.metadata.displayHeight),
            portFactory,
        )
    }
}


export function MakeDigitalCircuitAssembler(
    circuit: CircuitInternal,
    sim: DigitalSim,
    options: RenderOptions,
): CircuitAssembler {
    return new DigitalCircuitAssembler(circuit, options, sim, (params) => ({
        // Base types
        "DigitalWire": new DigitalWireAssembler(params, sim),
        "DigitalNode": new NodeAssembler(params, {
            // TODO[.](leon): transform the direction so that the angle of the node changes `dir`
            "outputs": () => ({ origin: V(0, 0), target: V(0, 0), dir: V(-1, 0) }),
            "inputs":  () => ({ origin: V(0, 0), target: V(0, 0), dir: V(+1, 0) }),
        }),
        // // Inputs
        "Switch":         new SwitchAssembler(params, sim),
        "Button":         new ButtonAssembler(params, sim),
        "Clock":          new ClockAssembler(params, sim),
        "ConstantHigh":   new ConstantHighAssembler(params, sim),
        "ConstantLow":    new ConstantLowAssembler(params, sim),
        "ConstantNumber": new ConstantNumberAssembler(params, sim),

        // // Outputs
        "LED": new LEDAssembler(params, sim),

        // Gates
        "ANDGate":  new ANDGateAssembler(params, sim, false),
        "NANDGate": new ANDGateAssembler(params, sim, true),
        "ORGate":   new ORGateAssembler(params, sim, { xor: false, not: false }),
        "NORGate":  new ORGateAssembler(params, sim, { xor: false, not: true  }),
        "XORGate":  new ORGateAssembler(params, sim, { xor: true,  not: false }),
        "XNORGate": new ORGateAssembler(params, sim, { xor: true,  not: true  }),

        // FlipFlops

        // Latches

        // Other
    }));
}
