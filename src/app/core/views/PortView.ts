import {DEFAULT_BORDER_COLOR, DEFAULT_FILL_COLOR, IO_PORT_BORDER_WIDTH, IO_PORT_LINE_WIDTH, IO_PORT_RADIUS, IO_PORT_SELECT_RADIUS, SELECTED_BORDER_COLOR, SELECTED_FILL_COLOR} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {CircleContains, RectContains} from "math/MathUtils";
import {Rect}                         from "math/Rect";
import {Transform}                    from "math/Transform";

import {DirtyVar} from "core/utils/DirtyVar";

import {Style} from "core/utils/rendering/Style";

import {Circle} from "core/utils/rendering/shapes/Circle";
import {Line}   from "core/utils/rendering/shapes/Line";

import {AnyPort} from "core/models/types";

import {CircuitController} from "core/controllers/CircuitController";

import {BaseView, RenderInfo, ViewCircuitInfo} from "./BaseView";
import {PortPos}                               from "./portinfo/types";
import {GetPortWorldPos}                       from "./portinfo/utils";


export abstract class PortView<
    Port extends AnyPort,
    Info extends ViewCircuitInfo<CircuitController> = ViewCircuitInfo<CircuitController>,
> extends BaseView<Port, Info> {
    protected pos: DirtyVar<PortPos>;

    public constructor(info: Info, obj: Port) {
        super(info, obj);

        this.pos = new DirtyVar(() => GetPortWorldPos(this.circuit, this.obj));
    }

    protected override renderInternal({ renderer, selections }: RenderInfo): void {
        const parentSelected = selections.has(this.obj.parent);
        const selected = selections.has(this.obj.id);

        const { origin, target } = this.pos.get();

        const lineCol       = (parentSelected && !selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
        const borderCol     = (parentSelected ||  selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
        const circleFillCol = (parentSelected ||  selected ? SELECTED_FILL_COLOR   : DEFAULT_FILL_COLOR);
        const lineStyle   = new Style(undefined, lineCol, IO_PORT_LINE_WIDTH);
        const circleStyle = new Style(circleFillCol, borderCol, IO_PORT_BORDER_WIDTH);

        renderer.draw(new Line(origin, target), lineStyle);
        renderer.draw(new Circle(target, IO_PORT_RADIUS), circleStyle);
    }

    public override onPropChange(propKey: string): void {
        super.onPropChange(propKey);

        if (["x", "y", "angle", "portConfig"].includes(propKey)) {
            this.pos.setDirty();
            this.cullTransform.setDirty();
        }
    }

    public override contains(pt: Vector): boolean {
        return CircleContains(this.getMidpoint(), IO_PORT_SELECT_RADIUS, pt);
    }
    public override isWithinBounds(bounds: Transform): boolean {
        return RectContains(bounds, this.getTargetPos());
    }

    public override getBounds(): Rect {
        const offset = V(IO_PORT_RADIUS + IO_PORT_BORDER_WIDTH/2);
        // Bounds are the Rectangle between the points + offset from the port circle
        return Rect.FromPoints(this.getOriginPos(), this.getTargetPos())
            .shift(this.getDir(), offset)
            .expand(this.getDir().negativeReciprocal().scale(offset));
    }

    public abstract isWireable(): boolean;
    public abstract isWireableWith(p: AnyPort): boolean;

    public getTargetPos(): Vector { return this.pos.get().target; }
    public getOriginPos(): Vector { return this.pos.get().origin; }
    public getDir(): Vector { return this.pos.get().dir; }

    public override getMidpoint(): Vector {
        return this.getTargetPos();
    }
}
