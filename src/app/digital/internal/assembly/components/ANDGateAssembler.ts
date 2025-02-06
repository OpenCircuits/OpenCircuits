import {parseColor} from "svg2canvas";

import {V} from "Vector";

import {Schema} from "core/schema";

import {DigitalComponentInfo} from "digital/internal/DigitalComponents";
import {DigitalSim}           from "digital/internal/sim/DigitalSim";

import {AssemblerParams, AssemblyReason} from "core/internal/assembly/Assembler";
import {ComponentAssembler} from "core/internal/assembly/ComponentAssembler";
import {Prim} from "core/internal/assembly/Prim";


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
        });

        this.sim = sim;
        this.info = this.circuit.doc.getObjectInfo("ANDGate") as DigitalComponentInfo;
    }

    private assembleLine(gate: Schema.Component): Prim {
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

        const transform = this.cache.componentTransforms.get(gate.id)!;
        const selected = this.selections.has(gate.id);

        return {
            kind: "Line",

            p1: transform.toWorldSpace(V(x, y1)),
            p2: transform.toWorldSpace(V(x, y2)),

            style: this.options.lineStyle(selected),
        }
    }

    private assembleImage(gate: Schema.Component): Prim {
        const selected = this.selections.has(gate.id);

        const tint = (selected ? parseColor(this.options.selectedFillColor) : undefined);

        return {
            kind: "SVG",

            svg:       "and.svg",
            transform: this.cache.componentTransforms.get(gate.id)!,

            tint,
        };
    }

    public override assemble(gate: Schema.Component, ev: Set<AssemblyReason>) {
        super.assemble(gate, ev);

        const added            = ev.has(AssemblyReason.Added);
        const transformChanged = ev.has(AssemblyReason.TransformChanged);
        const portAmtChanged   = ev.has(AssemblyReason.PortsChanged);
        const selectionChanged = ev.has(AssemblyReason.SelectionChanged);

        if (added || transformChanged) {
            this.cache.componentPrims.set(gate.id, [
                this.assembleLine(gate),
                this.assembleImage(gate),
            ]);
        } else if (portAmtChanged) {
            const [_, img] = this.cache.componentPrims.get(gate.id)!;
            this.cache.componentPrims.set(gate.id, [
                this.assembleLine(gate),
                img,
            ]);
        } else if (selectionChanged) {
            const [line, img] = this.cache.componentPrims.get(gate.id)!;

            if (line.kind !== "Line" || img.kind !== "SVG") {
                console.error(`Invalid prim type in ANDGateAssembler! ${line.kind}, ${img.kind}`);
                return;
            }

            const selected = this.selections.has(gate.id);

            line.style = this.options.lineStyle(selected);
            img.tint = (selected ? parseColor(this.options.selectedFillColor) : undefined);
        }
    }
}
