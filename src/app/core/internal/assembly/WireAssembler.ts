import {BezierCurve} from "math/BezierCurve";

import {Schema} from "core/schema";

import {Assembler, AssemblyReason} from "./Assembler";


export class WireAssembler extends Assembler<Schema.Wire> {
    protected calcWireCurve(wire: Schema.Wire) {
        const p1Pos = this.cache.portPositions.get(wire.p1)!, p2Pos = this.cache.portPositions.get(wire.p2)!;

        // Calc bezier curve points
        const p1 = p1Pos.target, c1 = p1.add(p1Pos.dir.scale(1));
        const p2 = p2Pos.target, c2 = p2.add(p2Pos.dir.scale(1));

        return new BezierCurve(p1, p2, c1, c2);
    }

    protected getWireStyle(wire: Schema.Wire) {
        return this.options.wireStyle(this.selections.has(wire.id), wire.props.color);
    }

    public override assemble(wire: Schema.Wire, reasons: Set<AssemblyReason>) {
        const added                = reasons.has(AssemblyReason.Added);
        const portPositionsChanged = reasons.has(AssemblyReason.TransformChanged);
        const selectionChanged     = reasons.has(AssemblyReason.SelectionChanged);

        if (added || portPositionsChanged) {
            const curve = this.calcWireCurve(wire);

            this.cache.wireCurves.set(wire.id, curve);
            this.cache.wirePrims.set(wire.id, [{
                kind:  "BezierCurve",
                curve: this.calcWireCurve(wire),
                style: this.getWireStyle(wire),
            }]);
        } else if (selectionChanged) {
            const [prim] = this.cache.wirePrims.get(wire.id)!;

            if (prim.kind !== "BezierCurve") {
                console.error(`Invalid prim type in WireAssembler! ${prim.kind}`);
                return;
            }
            prim.style = this.getWireStyle(wire);
        }
    }
}
