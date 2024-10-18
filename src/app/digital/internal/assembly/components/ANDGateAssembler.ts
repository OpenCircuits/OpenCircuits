import {SVGDrawing} from "svg2canvas";

import {V}         from "Vector";
import {Transform} from "math/Transform";

import {Assembler}            from "core/internal/assembly/Assembler";
import {PortAssembler}        from "core/internal/assembly/PortAssembler";
import {LinePrim}             from "core/internal/assembly/rendering/prims/LinePrim";
import {SVGPrim}              from "core/internal/assembly/rendering/prims/SVGPrim";
import {Schema}               from "core/schema";
import {DigitalComponentInfo} from "digital/internal/DigitalComponents";
import {DigitalSim}           from "digital/internal/sim/DigitalSim";
import {AssemblerParams} from "core/internal/assembly/Assembler";
import {SVGs} from "../svgs";


export class ANDGateAssembler extends Assembler<Schema.Component> {
    public readonly size = V(1, 1);

    protected readonly sim: DigitalSim;

    public img: SVGDrawing;

    protected portAssembler: PortAssembler;

    public constructor(params: AssemblerParams, sim: DigitalSim) {
        super(params);

        this.sim = sim;
        this.img = SVGs["and"];

        this.portAssembler = new PortAssembler(params, {
            "outputs": () => ({ origin: V(0.5, 0), dir: V(1, 0) }),
            "inputs":  (index, total) => {
                const spacing = 0.5 - this.options.defaultBorderWidth/2;
                return { origin: V(-0.5, spacing*((total-1)/2 - index)), dir: V(-1, 0) };
            },
        });
    }

    private assembleLine(gate: Schema.Component) {
        const { defaultBorderWidth } = this.options;

        const { inputPortGroups } = this.circuit.doc.getObjectInfo("ANDGate") as DigitalComponentInfo;

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

        return new LinePrim(
            transform.toWorldSpace(V(x, y1)),
            transform.toWorldSpace(V(x, y2)),
            this.options.lineStyle(selected),
        );
    }

    private assembleImage(gate: Schema.Component) {
        const selected = this.selections.has(gate.id);
        const tint = (selected ? this.options.selectedFillColor : undefined);
        return new SVGPrim(this.img, this.size, this.cache.componentTransforms.get(gate.id)!, tint);
    }

    public assemble(gate: Schema.Component, ev: unknown) {
        const transformChanged = /* use ev to see if our transform changed */ true;
        const selectionChanged = /* use ev to see if we were de/selected */ true;
        const portAmtChanged   = /* use ev to see if the number of ports changed */ true;

        if (!transformChanged && !selectionChanged && !portAmtChanged)
            return;

        if (transformChanged) {
            // Update transform
            this.cache.componentTransforms.set(gate.id, new Transform(
                V(gate.props.x ?? 0, gate.props.y ?? 0),
                this.size,
                (gate.props.angle ?? 0),
            ));
        }

        this.portAssembler.assemble(gate, ev);

        const [prevLine, prevImg] = (this.cache.componentPrims.get(gate.id) ?? []);

        const line = ((!prevLine || transformChanged || portAmtChanged) ? this.assembleLine(gate) : prevLine);
        const img  = ((!prevImg || transformChanged) ? this.assembleImage(gate) : prevImg);

        // Update styles only if only selections changed
        if (selectionChanged) {
            const selected = this.selections.has(gate.id);

            line.updateStyle(this.options.lineStyle(selected));
            img.updateStyle({ fill: (selected ? this.options.selectedFillColor : undefined) });
        }

        this.cache.componentPrims.set(gate.id, [line, img]);
    }
}
