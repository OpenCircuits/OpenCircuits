import {SVGDrawing} from "svg2canvas";

import {V}         from "Vector";
import {Transform} from "math/Transform";

import {CircuitInternal}      from "core/internal";
import {SelectionsManager}    from "core/internal/impl/SelectionsManager";
import {CircuitView}          from "core/internal/view/CircuitView";
import {PortAssembler}        from "core/internal/view/PortAssembler";
import {Line}                 from "core/internal/view/rendering/prims/Line";
import {SVGPrim}              from "core/internal/view/rendering/prims/SVG";
import {Style}                from "core/internal/view/rendering/Style";
import {Schema}               from "core/schema";
import {DigitalComponentInfo} from "digital/internal/DigitalComponents";
import {DigitalSim}           from "digital/internal/sim/DigitalSim";
import {Assembler}            from "core/internal/view/Assembler";


export class ANDGateAssembler extends Assembler<Schema.Component> {
    public readonly size = V(1, 1);
    public readonly img: SVGDrawing;

    protected readonly sim: DigitalSim;

    protected portAssembler: PortAssembler;

    public constructor(circuit: CircuitInternal, view: CircuitView, selections: SelectionsManager, sim: DigitalSim) {
        super(circuit, view, selections);

        this.sim = sim;

        this.img = view.options.getImage("and.svg")!;

        this.portAssembler = new PortAssembler(circuit, view, selections, {
            "outputs": () => ({ origin: V(0.5, 0), dir: V(1, 0) }),
            "inputs":  (index, total) => {
                const spacing = 0.5 - this.options.defaultBorderWidth/2;
                return { origin: V(-0.5, spacing*((total-1)/2 - index)), dir: V(-1, 0) };
            },
        });
    }

    private assembleLine(gate: Schema.Component) {
        const { defaultBorderWidth } = this.options;

        const { inputPortGroups } = this.circuit.getObjectInfo("ANDGate") as DigitalComponentInfo;

        // Get current number of inputs
        const numInputs = [...this.circuit.getPortsForComponent(gate.id).unwrap()]
            .map((id) => this.circuit.getPortByID(id).unwrap())
            .filter((p) => ((p) && (inputPortGroups.includes(p.group)))).length;

        const dy = (numInputs-1)/2*(0.5 - defaultBorderWidth/2);
        const y1 = -dy - defaultBorderWidth/2;
        const y2 =  dy + defaultBorderWidth/2;

        const x = -(this.size.x - defaultBorderWidth)/2;

        const transform = this.view.componentTransforms.get(gate.id)!;

        const selected = this.selections.has(gate.id);

        return new Line(
            transform.toWorldSpace(V(x, y1)),
            transform.toWorldSpace(V(x, y2)),
            this.options.lineStyle(selected),
        );
    }

    private assembleImage(gate: Schema.Component) {
        const selected = this.selections.has(gate.id);
        const tint = (selected ? this.options.selectedFillColor : undefined);
        return new SVGPrim(this.img, this.size, this.view.componentTransforms.get(gate.id)!, tint);
    }

    public assemble(gate: Schema.Component, ev: unknown) {
        const transformChanged = /* use ev to see if our transform changed */ true;
        const selectionChanged = /* use ev to see if we were de/selected */ true;
        const portAmtChanged   = /* use ev to see if the number of ports changed */ true;

        if (!transformChanged && !selectionChanged && !portAmtChanged)
            return;

        if (transformChanged) {
            // Update transform
            this.view.componentTransforms.set(gate.id, new Transform(
                V(gate.props.x ?? 0, gate.props.y ?? 0),
                this.size,
                (gate.props.angle ?? 0),
            ));
        }

        this.portAssembler.assemble(gate, ev);

        const [prevLine, prevImg] = (this.view.componentPrims.get(gate.id) ?? []);

        const line = ((!prevLine || transformChanged || portAmtChanged) ? this.assembleLine(gate) : prevLine);
        const img  = ((!prevImg || transformChanged) ? this.assembleImage(gate) : prevImg);

        // Update styles only if only selections changed
        if (selectionChanged) {
            const selected = this.selections.has(gate.id);

            line.updateStyle(this.options.lineStyle(selected));
            img.updateStyle({ fill: (selected ? this.options.selectedFillColor : undefined) });
        }

        this.view.componentPrims.set(gate.id, [line, img]);
    }
}
