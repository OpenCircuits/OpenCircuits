import {V}         from "Vector";

import {DigitalComponentInfo} from "digital/internal/DigitalComponents";
import {DigitalSim}           from "digital/internal/sim/DigitalSim";
import {AssemblerParams, AssemblyReason} from "core/internal/assembly/Assembler";
import {ComponentAssembler} from "core/internal/assembly/ComponentAssembler";
import type {QuadCurvePrim} from "core/internal/assembly/Prim";
import {Schema} from "core/schema";


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
        }, [
            { // Curve
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.PortsChanged]),
                assemble: (gate) => this.assembleQuadCurve(gate),

                styleChangesWhenSelected: true,
                getStyle: (comp) => this.options.curveStyle(this.selections.has(comp.id)),
            },
            { // SVG
                kind: "SVG",

                dependencies: new Set([AssemblyReason.TransformChanged]),
                assemble: (gate) => ({
                    kind: "SVG",

                    svg:       "or.svg",
                    transform: this.getTransform(gate),
                }),

                tintChangesWhenSelected: true,
                getTint: (comp) =>
                    (this.selections.has(comp.id) ? this.options.selectedFillColor : undefined),
            }
        ]);

        this.sim = sim;
        this.info = this.circuit.doc.getObjectInfo("ORGate") as DigitalComponentInfo;
    }

    private assembleQuadCurve(gate: Schema.Component) {
        const { defaultBorderWidth } = this.options;

        const { inputPortGroups } = this.circuit.doc.getObjectInfo("ORGate") as DigitalComponentInfo;

        // Get current number of inputs
        const numInputs = [...this.circuit.doc.getPortsForComponent(gate.id).unwrap()]
            .map((id) => this.circuit.doc.getPortByID(id).unwrap())
            .filter((p) => ((p) && (inputPortGroups.includes(p.group)))).length;

        const quadCurves: Array<Omit<QuadCurvePrim, "style">> = [];

        const transform = this.getTransform(gate);
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
                    kind: "QuadCurve",
                    p1:   transform.toWorldSpace(p1),
                    p2:   transform.toWorldSpace(p2),
                    c:    transform.toWorldSpace(c),
                })
            }
        }
        return {
            kind:  "Group",
            prims: quadCurves,
        } as const;
    }
}
