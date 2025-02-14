import {AssemblerParams} from "shared/api/circuit/internal/assembly/Assembler";
import {GateAssembler} from "./GateAssemblers";
import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";
import {V} from "Vector";
import {Schema} from "shared/api/circuit/schema";


export class ANDGateAssembler extends GateAssembler {

    public constructor(params: AssemblerParams, sim: DigitalSim, not: boolean) {
        super(params, sim, {
            kind: "ANDGate",
            size: V(1, 1),
            svg:  "and.svg",
            not,
            portFactory: {
                "outputs": () => ({ origin: V(0.5, 0), dir: V(1, 0) }),
                "inputs":  (index, total) => {
                    const spacing = 0.5 - this.options.defaultBorderWidth/2;
                    return { origin: V(-0.5, spacing*((total-1)/2 - index)), dir: V(-1, 0) };
                },
            },
            otherPrims: [
                { // Line
                    assemble: (gate) => this.assembleLine(gate),
                    getStyle: (comp) => this.options.lineStyle(this.selections.has(comp.id)),
                },
            ],
    });

    }

    private assembleLine(gate: Schema.Component) {
        const { defaultBorderWidth } = this.options;

        const inputPortGroups = this.info.inputPortGroups;

        // Get current number of inputs
        const numInputs = [...this.circuit.doc.getPortsForComponent(gate.id).unwrap()]
            .map((id) => this.circuit.doc.getPortByID(id).unwrap())
            .filter((p) => ((p) && (inputPortGroups.includes(p.group)))).length;

        const dy = (numInputs-1)/2*(0.5 - defaultBorderWidth/2);
        const y1 = -dy - defaultBorderWidth/2;
        const y2 =  dy + defaultBorderWidth/2;

        const x = -(this.size.x - defaultBorderWidth)/2;

        const transform = this.getTransform(gate);
        return {
            kind: "Line",

            p1: transform.toWorldSpace(V(x, y1)),
            p2: transform.toWorldSpace(V(x, y2)),
        } as const;
    }
}