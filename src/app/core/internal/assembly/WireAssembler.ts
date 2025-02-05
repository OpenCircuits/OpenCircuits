import {BezierCurve} from "math/BezierCurve";

import {Schema} from "core/schema";

import {Assembler}       from "./Assembler";
import {BezierCurvePrim} from "./prims/BezierCurvePrim";


export class WireAssembler extends Assembler<Schema.Wire> {
    protected assembleCurve(wire: Schema.Wire) {
        return new BezierCurvePrim(
            this.cache.wireCurves.get(wire.id)!
        );
    }

    public assemble(wire: Schema.Wire, _: unknown): void {
        const portPositionsChanged = /* use ev to see if either port position changed */ true;
        const selectionChanged     = /* use ev to see if parent was de/selected */ true;

        if (!portPositionsChanged && !selectionChanged)
            return;

        if (portPositionsChanged) {
            const p1Pos = this.cache.portPositions.get(wire.p1)!, p2Pos = this.cache.portPositions.get(wire.p2)!;

            // Calc bezier curve points
            const p1 = p1Pos.target, c1 = p1.add(p1Pos.dir.scale(1));
            const p2 = p2Pos.target, c2 = p2.add(p2Pos.dir.scale(1));
            this.cache.wireCurves.set(wire.id, new BezierCurve(p1, p2, c1, c2));
        }

        const [prevCurve] = (this.cache.wirePrims.get(wire.id) ?? []);

        const curve = ((!prevCurve || portPositionsChanged) ? this.assembleCurve(wire) : prevCurve);

        this.cache.wirePrims.set(wire.id, [curve]);
    }
}
