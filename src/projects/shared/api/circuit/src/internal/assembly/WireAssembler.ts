import {BezierCurve} from "math/BezierCurve";
import {Curve}       from "math/Curve";
import {LineCurve}   from "math/Line";

import {Schema} from "shared/api/circuit/schema";

import {Assembler, AssemblyReason} from "./Assembler";
import {Prim} from "./Prim";


export class WireAssembler extends Assembler<Schema.Wire> {
    protected getCurveAndPrim(wire: Schema.Wire): [Curve, Prim] {
        const p1Pos = this.cache.portPositions.get(wire.p1)!,
              p2Pos = this.cache.portPositions.get(wire.p2)!;
        const p1 = p1Pos!.target, p2 = p2Pos!.target;

        const isStraight = (
            (Math.abs(p1.x - p2.x) <= 1e-5) ||
            (Math.abs(p1.y - p2.y) <= 1e-5)
        );

        // If ports are approximately on the same axis, the curve should instead be a line
        if (isStraight) {
            return [
                new LineCurve(p1, p2),
                {
                    kind: "Line",
                    p1, p2,
                    style: this.getWireStyle(wire),
                },
            ];
        }

        const c1 = p1.add(p1Pos.dir.scale(1)), c2 = p2.add(p2Pos.dir.scale(1));
        const curve = new BezierCurve(p1, p2, c1, c2);
        return [
            curve,
            {
                kind:  "BezierCurve",
                curve,
                style: this.getWireStyle(wire),
            },
        ];
    }

    protected getWireStyle(wire: Schema.Wire) {
        return this.options.wireStyle(this.isSelected(wire.id), wire.props.color);
    }

    public override assemble(wire: Schema.Wire, reasons: Set<AssemblyReason>) {
        const added                = reasons.has(AssemblyReason.Added);
        const portPositionsChanged = reasons.has(AssemblyReason.TransformChanged);
        const selectionChanged     = reasons.has(AssemblyReason.SelectionChanged);

        if (added || portPositionsChanged) {
            const [curve, prim] = this.getCurveAndPrim(wire);

            this.cache.wireCurves.set(wire.id, curve);
            this.cache.wirePrims.set(wire.id, [prim]);
        } else if (selectionChanged) {
            const [prim] = this.cache.wirePrims.get(wire.id)!;

            if (prim.kind !== "BezierCurve" && prim.kind !== "Line") {
                console.error(`Invalid prim type in WireAssembler! ${prim.kind}`);
                return;
            }
            prim.style = this.getWireStyle(wire);
        }
    }
}
