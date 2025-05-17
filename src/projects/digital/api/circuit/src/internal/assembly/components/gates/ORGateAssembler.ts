import {V} from "Vector";

import {FMod}      from "math/MathUtils";
import {QuadCurve} from "math/QuadCurve";

import {Schema}             from "shared/api/circuit/schema";
import {AssemblerParams}    from "shared/api/circuit/internal/assembly/Assembler";
import {PositioningHelpers} from "shared/api/circuit/internal/assembly/PortAssembler";

import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";

import {GateAssembler, SimplifiedAssembly} from "./GateAssemblers";


export interface ORGateAssemblerParams {
    xor: boolean;
    not: boolean;
}
export class ORGateAssembler extends GateAssembler {
    private static readonly KIND_MAP = {
        // {xor},{not}
        "true,true":   "XNORGate",
        "true,false":  "XORGate",
        "false,true":  "NORGate",
        "false,false": "ORGate",
    } as const;

    public constructor(params: AssemblerParams, sim: DigitalSim, { xor, not }: ORGateAssemblerParams) {
        super(params, sim, {
            kind: ORGateAssembler.KIND_MAP[`${xor},${not}`],
            size: V(1.2, 1),
            svg:  "or.svg",
            not,

            portFactory: {
                "inputs": (comp, index, total) => {
                    // Calculate quad curve position as a function of y, assumes curve has the following properties:
                    //  q.p1.x = q.p2.x ^ c.x = 0
                    const q = this.calcBaseQuadCurve(), W = q.p2.y - q.p1.y;
                    const QuadCurveAtPos = (y: number) =>
                        (2*(q.p1.x - q.c.x)/(W**2) * (y**2) + (q.p1.x + q.c.x)/2);

                    const y = -PositioningHelpers.ConstantSpacing(index, total, this.getSize(comp).y + this.options.defaultBorderWidth, { spacing: 0.5 });
                    const x = QuadCurveAtPos(FMod(y + W/2, W) - W/2) - 0.005;
                    return {
                        origin: V(x, y),
                        target: V(-1, y),
                    };
                },
                "outputs": () => ({ origin: V(0.5, 0), dir: V(1, 0) }),
            },
            otherPrims: [
                { // Curve 1
                    assemble: (gate) => this.assembleQuadCurve(gate, 0),
                    getStyle: (gate) => this.options.curveStyle(this.isSelected(gate.id)),
                },
                // Curve 2
                ...(xor ? [{
                    assemble: (gate) => this.assembleQuadCurve(gate, -0.24),
                    getStyle: (gate) => this.options.curveStyle(this.isSelected(gate.id)),
                } satisfies SimplifiedAssembly] : []),
            ],
        });
    }

    private calcBaseQuadCurve() {
        const h = this.options.defaultBorderWidth;
        const W = 1 - h;

        return new QuadCurve(
            V(-0.5 + h, -W/2),
            V(-0.5 + h, +W/2),
            V(-0.15, 0)
        );
    }

    private assembleQuadCurve(gate: Schema.Component, dx: number) {
        const { inputPortGroups } = this.info;

        // Get current number of inputs and calculate # of curves needed
        const numInputs = [...this.circuit.getPortsForComponent(gate.id).unwrap()]
            .map((id) => this.circuit.getPortByID(id).unwrap())
            .filter((p) => (p && inputPortGroups.includes(p.group))).length;
        const amt = 2 * Math.floor(numInputs / 4) + 1;

        const baseQuadCurve = this.calcBaseQuadCurve();
        const transform = this.getTransform(gate);
        return {
            kind:  "Group",
            prims: new Array(amt).fill(0).map((_, i) => {
                const d = (i - Math.floor(amt / 2)) * (baseQuadCurve.p2.y - baseQuadCurve.p1.y);
                return {
                    kind: "QuadCurve",

                    curve: new QuadCurve(
                        transform.toWorldSpace(baseQuadCurve.p1.add(dx, d)),
                        transform.toWorldSpace(baseQuadCurve.p2.add(dx, d)),
                        transform.toWorldSpace(baseQuadCurve.c.add(dx, d)),
                    ),
                } as const;
            }),
        } as const;
    }
}
