import {SVGDrawing} from "svg2canvas";

import {V}         from "Vector";
import {Transform} from "math/Transform";

import {CircuitInternal}      from "core/internal";
import {SelectionsManager}    from "core/internal/impl/SelectionsManager";
import {CircuitView}          from "core/internal/view/CircuitView";
import {PortAssembler}        from "core/internal/view/PortAssembler";
import {LinePrim}             from "core/internal/view/rendering/prims/LinePrim";
import {QuadCurvePrim}        from "core/internal/view/rendering/prims/QuadCurvePrim";
import {SVGPrim}              from "core/internal/view/rendering/prims/SVGPrim";
import {Style, StrokeStyle}   from "core/internal/view/rendering/Style";
import {Schema}               from "core/schema";
import {DigitalComponentInfo} from "digital/internal/DigitalComponents";
import {DigitalSim}           from "digital/internal/sim/DigitalSim";
import {Assembler}            from "core/internal/view/Assembler";


export class XORGateAssembler extends Assembler<Schema.Component> {
    public readonly size = V(1.2, 1);
    public readonly img: SVGDrawing;

    protected readonly sim: DigitalSim;

    protected portAssembler: PortAssembler;

    public constructor(circuit: CircuitInternal, view: CircuitView, selections: SelectionsManager, sim: DigitalSim) {
        super(circuit, view, selections);

        this.sim = sim;

        this.img = view.options.getImage("or.svg")!;

        this.portAssembler = new PortAssembler(circuit, view, selections, {
            "outputs": () => ({ origin: V(0.5, 0), dir: V(1.1, 0)}),
            "inputs":  (index, total) => {
                if (total % 2 == 0) {
                    const spacing = 0.52 - this.options.defaultBorderWidth/2;
                    return { origin: V(-0.43, spacing*((total-1)/2 - index)), dir: V(-1.3, 0) };
                } else {
                    const spacing = 0.50 - this.options.defaultBorderWidth/2;
                    if ((total == 7 && index == 0) || (total == 7 && index == 6)) {
                        return { origin: V(-0.53, spacing*((total-1)/2 - index)), dir: V(-1.41, 0) };
                    }
                    return { origin: V(-0.40, spacing*((total-1)/2 - index)), dir: V(-1.6, 0) };
                }
            },
        });
    }

    private assembleQuadCurve(gate: Schema.Component, dx: number) : QuadCurvePrim[] {
        const { defaultBorderWidth, selectedBorderColor, defaultBorderColor, fillStyle } = this.options;

        const { inputPortGroups } = this.circuit.getObjectInfo("XORGate") as DigitalComponentInfo;

         // Get current number of inputs
         const numInputs = [...this.circuit.getPortsForComponent(gate.id).unwrap()]
            .map((id) => this.circuit.getPortByID(id).unwrap())
            .filter((p) => ((p) && (inputPortGroups.includes(p.group)))).length;

        const amt = 2 * Math.floor(numInputs / 4) + 1;

        // Renders a specialized shorter curve for an xor and xnor gate (dx != 0) when there are 2 or 3 ports (amt == 1)
        const [lNumMod, sMod] = (amt === 1 && dx !== 0) ? ([0.014, 0]) : ([0, 0.012]);

        let quadCurves = [];

        const h = defaultBorderWidth;
        const l1 = -this.size.y / 2 + lNumMod;
        const l2 = +this.size.y / 2 - lNumMod;

        const s = this.size.x / 2 - h + sMod;
        const l = this.size.x / 5 - h;

        const transform = this.view.componentTransforms.get(gate.id)!;
        const selected = this.selections.has(gate.id);

        for (let i = 0; i < amt; i++) {
            const d = (i - Math.floor(amt / 2)) * this.size.y;
            const p1 = V(-s + dx, l1 + d);
            const p2 = V(-s + dx, l2 + d);
            const c = V(-l + dx, d);
            
            let qc = new QuadCurvePrim(
                transform.toWorldSpace(p1),
                transform.toWorldSpace(p2), 
                transform.toWorldSpace(c), 
                this.options.curveStyle(selected));
            
            if (amt === 1 && dx !== 0) {
                quadCurves.push(qc);
            }
            else if (amt !== 1 || dx !== 0) {
                let style = this.options.curveStyle(selected);
                if (style.stroke) {
                    style.stroke.lineCap = "round";
                }
                qc.updateStyle(style);
                quadCurves.push(qc)
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

        const quadCurvesFront = ((!prevLine || transformChanged || portAmtChanged) ? this.assembleQuadCurve(gate, 0) : []);
        const quadCurvesBack = ((!prevLine || transformChanged || portAmtChanged) ? this.assembleQuadCurve(gate, -0.24) : []);
        const img  = ((!prevImg || transformChanged) ? this.assembleImage(gate) : prevImg);

        
        // Update styles only if only selections changed
        if (selectionChanged) {
            const selected = this.selections.has(gate.id);

            // TODO: update each quadCurve style, at the moment this.options.curveStyle(selected)
            //       does not hold any info about linecap settings (i.e round, square )
            //       the commented code will overwrite any previously set linecap
            for (let i = 0; i < quadCurvesFront.length; i++) {
                // quadCurvesFront[i].updateStyle(this.options.curveStyle(selected));
                // quadCurvesBack[i].updateStyle(this.options.curveStyle(selected));
            }
            img.updateStyle({ fill: (selected ? this.options.selectedFillColor : undefined) });
        }
        
        let image = [...quadCurvesFront, ...quadCurvesBack, img];
        this.view.componentPrims.set(gate.id, image);
    }
}
