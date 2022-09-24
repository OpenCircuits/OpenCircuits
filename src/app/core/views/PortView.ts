import {DEFAULT_BORDER_COLOR, DEFAULT_FILL_COLOR, IO_PORT_BORDER_WIDTH, IO_PORT_LINE_WIDTH, IO_PORT_RADIUS, IO_PORT_SELECT_RADIUS, SELECTED_BORDER_COLOR, SELECTED_FILL_COLOR} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {CircleContains, RectContains} from "math/MathUtils";
import {Rect}                         from "math/Rect";
import {Transform}                    from "math/Transform";

import {Style} from "core/utils/rendering/Style";

import {Circle} from "core/utils/rendering/shapes/Circle";
import {Line}   from "core/utils/rendering/shapes/Line";

import {AnyObj, AnyPort, AnyWire} from "core/models/types";

import {CircuitController} from "core/controllers/CircuitController";

import {BaseView, RenderInfo} from "./BaseView";
import {GetPortWorldPos}      from "./PortInfo";


export abstract class PortView<
    Port extends AnyPort,
    Circuit extends CircuitController<AnyObj> = CircuitController<AnyObj>,
> extends BaseView<Port, Circuit> {
    protected override renderInternal({ renderer, selections }: RenderInfo): void {
        const parentSelected = selections.has(this.obj.parent);
        const selected = selections.has(this.obj.id);

        const { origin, target } = GetPortWorldPos(this.circuit, this.obj);

        const lineCol       = (parentSelected && !selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
        const borderCol     = (parentSelected ||  selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
        const circleFillCol = (parentSelected ||  selected ? SELECTED_FILL_COLOR   : DEFAULT_FILL_COLOR);
        const lineStyle   = new Style(undefined, lineCol, IO_PORT_LINE_WIDTH);
        const circleStyle = new Style(circleFillCol, borderCol, IO_PORT_BORDER_WIDTH);

        renderer.draw(new Line(origin, target), lineStyle);
        renderer.draw(new Circle(target, IO_PORT_RADIUS), circleStyle);
    }

    public override contains(pt: Vector, bounds: "select" | "press"): boolean {
        return CircleContains(
            GetPortWorldPos(this.circuit, this.obj).target,
            ((bounds === "select") ? IO_PORT_SELECT_RADIUS : IO_PORT_RADIUS),
            pt
        );
    }
    public override isWithinBounds(bounds: Transform): boolean {
        return RectContains(bounds, GetPortWorldPos(this.circuit, this.obj).target);
    }

    protected override getBounds(): Rect {
        // Bounds are the Rectangle between the points + offset from the port circle
        const pos = GetPortWorldPos(this.circuit, this.obj);
        const dir = pos.target.sub(pos.origin).normalize();
        return Rect.FromPoints(pos.origin, pos.target)
            .shift(dir, V(IO_PORT_RADIUS + IO_PORT_BORDER_WIDTH/2))
            .expand(dir.negativeReciprocal().scale(V(IO_PORT_RADIUS + IO_PORT_BORDER_WIDTH/2)));
    }

    public abstract isWireable(): boolean;
    public abstract isWireableWith(p: AnyPort): boolean;

    public override getMidpoint(): Vector {
        return GetPortWorldPos(this.circuit, this.obj).target;
    }
}
