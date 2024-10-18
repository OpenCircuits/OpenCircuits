import {SVGDrawing} from "svg2canvas";

import {V}         from "Vector";
import {Transform} from "math/Transform";

import {CircuitInternal}      from "core/internal";
import {SelectionsManager}    from "core/internal/impl/SelectionsManager";
import {CircuitView}          from "core/internal/view/CircuitView";
import {PortAssembler}        from "core/internal/view/PortAssembler";
import {QuadCurve}            from "core/internal/view/rendering/prims/QuadCurve";
import {SVGPrim}              from "core/internal/view/rendering/prims/SVGPrim";
import {Style}                from "core/internal/view/rendering/Style";
import {Schema}               from "core/schema";
import {DigitalComponentInfo} from "digital/internal/DigitalComponents";
import {DigitalSim}           from "digital/internal/sim/DigitalSim";
import {Assembler}            from "core/internal/view/Assembler";


export class ORGateAssembler extends Assembler<Schema.Component> {
    public readonly size = V(1.2, 1);

    public img?: SVGDrawing;

    protected readonly sim: DigitalSim;

    protected portAssembler: PortAssembler;

    public constructor(circuit: CircuitInternal, view: CircuitView, selections: SelectionsManager, sim: DigitalSim) {
        super(circuit, view, selections);

        this.sim = sim;

        view.images.subscribe(({ key, val }) => {
            if (key === "or.svg") {
                this.img = val;
                // TODO[model_refactor_api](leon) - Invalidate all OR gates to re-assemble with new image
            }
        });

        this.portAssembler = new PortAssembler(circuit, view, selections, {
            "outputs": () => ({ origin: V(0.5, 0), dir: V(1.1, 0) }),
            "inputs":  (index, total) => {
                if (total % 2 === 0) {
                    const spacing = 0.52 - this.options.defaultBorderWidth/2;
                    return {
                        origin: V(-0.43, spacing*((total-1)/2 - index)),
                        dir:    V(-1.3, 0),
                    };
                }
                    const spacing = 0.5 - this.options.defaultBorderWidth/2;
                    if ((total === 7 && index === 0) || (total === 7 && index === 6)) {
                        return {
                            origin: V(-0.53, spacing*((total-1)/2 - index)),
                            dir:    V(-1.1, 0) };
                    }
                    return {
                        origin: V(-0.4,spacing*((total-1)/2 - index)),
                        dir:    V(-1.3, 0),
                    };

            },
        });
    }

    private assembleQuadCurve(gate: Schema.Component) {
        const { defaultBorderWidth, selectedBorderColor, defaultBorderColor, fillStyle } = this.options;

        const { inputPortGroups } = this.circuit.doc.getObjectInfo("XORGate") as DigitalComponentInfo;

        // Get current number of inputs
        const numInputs = [...this.circuit.doc.getPortsForComponent(gate.id).unwrap()]
            .map((id) => this.circuit.doc.getPortByID(id).unwrap())
            .filter((p) => ((p) && (inputPortGroups.includes(p.group)))).length;

        const quadCurves: QuadCurve[] = [];

        const transform = this.view.componentTransforms.get(gate.id)!;
        const selected = this.selections.has(gate.id);
        const amt = 2 * Math.floor(numInputs / 4) + 1;
        const [lNumMod, sMod] = (amt === 1) ? ([0.014, 0]) : ([0, 0.012]);
        for (let i = 0; i < amt; i++) {
            const d = (i - Math.floor(amt / 2)) * this.size.y;
            const h = defaultBorderWidth;
            const l1 = -this.size.y / 2 + lNumMod;
            const l2 = +this.size.y / 2 - lNumMod;

            const s = this.size.x / 2 - h + sMod;
            const l = this.size.x / 5 - h;

            const p1 = V(-s, l1 + d);
            const p2 = V(-s, l2 + d);

            const c = V(-l, d);

            if (amt != 1) {
                quadCurves.push(new QuadCurve(
                    transform.toWorldSpace(p1),
                    transform.toWorldSpace(p2),
                    transform.toWorldSpace(c),
                    { stroke: { color: "black", size: 0.05, lineCap: "round" } }
                ));
            }
        }
        return quadCurves;
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

        const image = [];
        const line = this.assembleQuadCurve(gate);
        const img  = ((!prevImg || transformChanged) ? this.assembleImage(gate) : prevImg);

        line.forEach((q) => image.push(q));
        image.push(img);

        this.view.componentPrims.set(gate.id, image);
    }
}
