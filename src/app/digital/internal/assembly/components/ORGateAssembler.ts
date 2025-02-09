import {V}         from "Vector";

import {Schema}               from "core/schema";
import {DigitalComponentInfo} from "digital/internal/DigitalComponents";
import {DigitalSim}           from "digital/internal/sim/DigitalSim";
import {AssemblerParams, AssemblyReason} from "core/internal/assembly/Assembler";
import {ComponentAssembler} from "core/internal/assembly/ComponentAssembler";
import type {Prim, QuadCurvePrim} from "core/internal/assembly/Prim";
import {parseColor} from "svg2canvas";


export class ORGateAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;

    protected info: DigitalComponentInfo;

    public constructor(params: AssemblerParams, sim: DigitalSim) {
        super(params, V(1.2, 1), {
            "outputs": () => ({ origin: V(0.5, 0), dir: V(1.1, 0) }),
            "inputs":  (index, total) => {
                if (total % 2 === 0) {
                    const spacing = 0.52 - this.options.defaultBorderWidth/2;
                    return {
                        origin: V(-0.42, spacing*((total-1)/2 - index)),
                        dir:    V(-1.28, 0),
                    };
                }
                const spacing = 0.5 - this.options.defaultBorderWidth/2;
                if ((total === 7 && index === 0) || (total === 7 && index === 6)) {
                    return {
                        origin: V(-0.53, spacing*((total-1)/2 - index)),
                        dir:    V(-1.1, 0) };
                }
                return {
                    origin: V(-0.4, spacing*((total-1)/2 - index)),
                    dir:    V(-1.3, 0),
                };
            },
        });

        this.sim = sim;
        this.info = this.circuit.doc.getObjectInfo("ORGate") as DigitalComponentInfo;
    }

    private assembleQuadCurve(gate: Schema.Component): Prim[] {
        const { defaultBorderWidth } = this.options;

        const { inputPortGroups } = this.circuit.doc.getObjectInfo("ORGate") as DigitalComponentInfo;

        // Get current number of inputs
        const numInputs = [...this.circuit.doc.getPortsForComponent(gate.id).unwrap()]
            .map((id) => this.circuit.doc.getPortByID(id).unwrap())
            .filter((p) => ((p) && (inputPortGroups.includes(p.group)))).length;

        const quadCurves: QuadCurvePrim[] = [];

        const transform = this.cache.componentTransforms.get(gate.id)!;
        const amt = 2 * Math.floor(numInputs / 4) + 1;
        const [lNumMod, sMod] = (amt === 1) ? ([0.014, 0]) : ([0, 0.012]);

        const h = defaultBorderWidth;
        const l1 = -this.size.y / 2 + lNumMod;
        const l2 = +this.size.y / 2 - lNumMod;

        const s = this.size.x / 2 - h + sMod;
        const l = this.size.x / 5 - h;

        for (let i = 0; i < amt; i++) {
            const d = (i - Math.floor(amt / 2)) * this.size.y;

            const p1 = V(-s, l1 + d);
            const p2 = V(-s, l2 + d);

            const c = V(-l, d);

            if (amt !== 1) {
                quadCurves.push({
                    kind:  "QuadCurve",
                    p1:    transform.toWorldSpace(p1),
                    p2:    transform.toWorldSpace(p2),
                    c:     transform.toWorldSpace(c),
                    style: { stroke: { color: "black", size: 0.05, lineCap: "round" } },
                })
            }
        }
        return quadCurves;
    }

    private assembleImage(gate: Schema.Component): Prim {
        const selected = this.selections.has(gate.id);

        const tint = (selected ? parseColor(this.options.selectedFillColor) : undefined);

        return {
            kind: "SVG",

            svg:       "or.svg",
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
                this.assembleImage(gate),
                ...this.assembleQuadCurve(gate),
            ]);
        } else if (portAmtChanged) {
            const [img, ..._] = this.cache.componentPrims.get(gate.id)!;
            this.cache.componentPrims.set(gate.id, [
                img,
                ...this.assembleQuadCurve(gate),
            ]);
        } else if (selectionChanged) {
            const [img, ...quadCurves] = this.cache.componentPrims.get(gate.id)!;

            if (quadCurves.some((quadCurve) => quadCurve.kind !== "QuadCurve") || img.kind !== "SVG") {
                console.error(`Invalid prim type in ORGateAssembler! ${
                    quadCurves.map((quadCurve) => quadCurve.kind !== "QuadCurve")
                }, ${img.kind}`);
                return;
            }

            const selected = this.selections.has(gate.id);

            quadCurves.forEach((quadCurve) => {
                // TODO: better type safe way of handling this?
                (quadCurve as QuadCurvePrim).style = this.options.curveStyle(selected);
            })
            img.tint = (selected ? parseColor(this.options.selectedFillColor) : undefined);
        }
    }
}
