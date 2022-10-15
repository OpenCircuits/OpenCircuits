import {ColorToHex, blend, parseColor} from "svg2canvas";

import {SELECTED_FILL_COLOR, WIRE_THICKNESS} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {BezierCurve}    from "math/BezierCurve";
import {BezierContains} from "math/MathUtils";
import {Rect}           from "math/Rect";
import {Transform}      from "math/Transform";

import {DirtyVar} from "core/utils/DirtyVar";

import {Style} from "core/utils/rendering/Style";

import {Curve} from "core/utils/rendering/shapes/Curve";

import {AnyObj, AnyPort, AnyWire} from "core/models/types";

import {CircuitController} from "core/controllers/CircuitController";

import {BaseView, RenderInfo} from "./BaseView";
import {GetPortWorldPos}      from "./portinfo/utils";


export class WireView<
    Wire extends AnyWire,
    Circuit extends CircuitController<AnyObj> = CircuitController<AnyObj>,
> extends BaseView<Wire, Circuit> {
    protected curve: DirtyVar<BezierCurve>;

    public constructor(circuit: Circuit, obj: Wire) {
        super(circuit, obj);

        this.curve = new DirtyVar(
            () => {
                const [port1, port2] = this.circuit.getPortsForWire(this.obj);
                const [p1, c1] = this.getCurvePoints(port1);
                const [p2, c2] = this.getCurvePoints(port2);
                return new BezierCurve(p1, p2, c1, c2);
            }
        );
    }

    public override onPropChange(propKey: string): void {
        super.onPropChange(propKey);

        if (["x", "y", "angle", "portConfig"].includes(propKey))
            this.curve.setDirty();
    }

    public override contains(pt: Vector): boolean {
        return BezierContains(this.curve.get(), pt);
    }
    public override isWithinBounds(_: Transform): boolean {
        return false;
    }

    protected override renderInternal({ renderer, selections }: RenderInfo): void {
        const selected = selections.has(this.obj.id);

        // Changes color of wires: when wire is selected it changes to the color
        //  selected blended with constant color SELECTED_FILL_COLOR
        const selectedColor = ColorToHex(blend(
            parseColor(this.obj.color),
            parseColor(SELECTED_FILL_COLOR!), 0.2
        ));

        // @TODO move to function for getting color based on being selection/on/off
        const color = (selected ? selectedColor : this.obj.color);
        const style = new Style(undefined, color, WIRE_THICKNESS);

        renderer.draw(new Curve(this.curve.get()), style);
    }

    protected getCurvePoints(port: AnyPort): [Vector, Vector] {
        const { target, dir } = GetPortWorldPos(this.circuit, port);
        return [target, target.add(dir.scale(1))];
    }

    public override getMidpoint(): Vector {
        return this.curve.get().getPos(0.5);
    }

    protected override getBounds(): Rect {
        return this.curve.get().getBoundingBox().expand(V(WIRE_THICKNESS/2));
    }

    public override getLayer(): number {
        return -1;
    }
}