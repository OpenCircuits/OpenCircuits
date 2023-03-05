import {BezierCurve} from "math/BezierCurve";

import {Schema} from "core/schema";

import {Assembler}       from "./Assembler";
import {BezierCurvePrim} from "./rendering/prims/BezierCurvePrim";


export class WireAssembler extends Assembler<Schema.Wire> {
    protected assembleCurveStyle(wire: Schema.Wire) {
        return this.options.wireStyle(
            this.selections.has(wire.id),
            (wire.props.color ?? "#ffffff"),
        );
    }

    protected assembleCurve(wire: Schema.Wire) {
        return new BezierCurvePrim(
            this.view.wireCurves.get(wire.id)!,
            this.assembleCurveStyle(wire),
        );
    }

    public assemble(wire: Schema.Wire, ev: unknown): void {
        const portPositionsChanged = /* use ev to see if either port position changed */ true;
        const selectionChanged     = /* use ev to see if parent wwas de/selected */ true;

        if (!portPositionsChanged && !selectionChanged)
            return;

        if (portPositionsChanged) {
            const p1Pos = this.view.portPositions.get(wire.p1)!, p2Pos = this.view.portPositions.get(wire.p2)!;

            // Calc bezier curve points
            const p1 = p1Pos.target, c1 = p1.add(p1Pos.dir.scale(1));
            const p2 = p2Pos.target, c2 = p2.add(p2Pos.dir.scale(1));
            this.view.wireCurves.set(wire.id, new BezierCurve(p1, p2, c1, c2));
        }

        const [prevCurve] = (this.view.wirePrims.get(wire.id) ?? []);

        const curve = ((!prevCurve || portPositionsChanged) ? this.assembleCurve(wire) : prevCurve);

        // Update styles only if only selections changed
        if (selectionChanged)
            curve.updateStyle(this.assembleCurveStyle(wire));

        this.view.wirePrims.set(wire.id, [curve]);
    }
}
