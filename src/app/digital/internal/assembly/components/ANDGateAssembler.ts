import {V} from "Vector";

import {DigitalComponentInfo} from "digital/internal/DigitalComponents";
import {DigitalSim}           from "digital/internal/sim/DigitalSim";

import {AssemblerParams, AssemblyReason} from "core/internal/assembly/Assembler";
import {ComponentAssembler} from "core/internal/assembly/ComponentAssembler";
import {Schema} from "core/schema";


export class ANDGateAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;

    protected info: DigitalComponentInfo;

    public constructor(params: AssemblerParams, sim: DigitalSim) {
        super(params, V(1, 1), {
            "outputs": () => ({ origin: V(0.5, 0), dir: V(1, 0) }),
            "inputs":  (index, total) => {
                const spacing = 0.5 - this.options.defaultBorderWidth/2;
                return { origin: V(-0.5, spacing*((total-1)/2 - index)), dir: V(-1, 0) };
            },
        }, [
            { // Line
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.PortsChanged]),
                assemble: (gate) => this.assembleLine(gate),

                styleChangesWhenSelected: true,
                getStyle: (comp) => this.options.lineStyle(this.selections.has(comp.id)),
            },
            { // SVG
                kind: "SVG",

                dependencies: new Set([AssemblyReason.TransformChanged]),
                assemble:     (gate) => ({
                    kind: "SVG",

                    svg:       "and.svg",
                    transform: this.getTransform(gate),
                }),

                tintChangesWhenSelected: true,
                getTint: (gate) =>
                    (this.selections.has(gate.id) ? this.options.selectedFillColor : undefined),
            },
        ]);

        this.sim = sim;
        this.info = this.circuit.doc.getObjectInfo("ANDGate") as DigitalComponentInfo;
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
