import {Color, blend, parseColor} from "svg2canvas";

import {DEFAULT_BORDER_COLOR, DEFAULT_BORDER_WIDTH, DEFAULT_CURVE_BORDER_WIDTH, DEFAULT_FILL_COLOR, IO_PORT_BORDER_WIDTH, IO_PORT_LINE_WIDTH, IO_PORT_RADIUS, SELECTED_BORDER_COLOR, SELECTED_FILL_COLOR, WIRE_THICKNESS} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {BezierCurve}                    from "math/BezierCurve";
import {BezierContains, CircleContains} from "math/MathUtils";
import {Rect}                           from "math/Rect";
import {Transform}                      from "math/Transform";

import {GetDebugInfo} from "core/utils/Debug";
import {DirtyVar}     from "core/utils/DirtyVar";

import {Style} from "core/utils/rendering/Style";

import {Circle} from "core/utils/rendering/shapes/Circle";
import {Curve}  from "core/utils/rendering/shapes/Curve";
import {Line}   from "core/utils/rendering/shapes/Line";

import {ANDGate, DigitalComponent, DigitalObj, DigitalPort, DigitalWire} from "core/models/types/digital";

import {CircuitController}                             from "core/controllers/CircuitController";
import {BaseView, RenderInfo}                          from "core/views/BaseView";
import {ComponentView}                                 from "core/views/ComponentView";
import {CalcPortGroupingID, GetPortWorldPos, PortInfo} from "core/views/PortInfo";
import {ViewRecord}                                    from "core/views/ViewManager";


// @TODO @leon - Move this function to "svg2canvas"
function ColorToHex(col: Color): string {
    return `#${[col.r, col.g, col.b].map((x) => {
        const hex = Math.round(x).toString(16);
        return (hex.length === 1 ? "0"+hex : hex);
    }).join("")}`
}


type DigitalCircuitController = CircuitController<DigitalObj>;


class ANDGateView extends ComponentView<ANDGate, DigitalCircuitController> {
    public constructor(circuit: CircuitController<DigitalObj>, obj: ANDGate) {
        super(circuit, obj, V(1, 1), "and.svg");
    }

    protected override renderComponent({ renderer, selections }: RenderInfo): void {
        const selected = selections.has(this.obj.id);

        const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);

        const style = new Style(undefined, borderCol, DEFAULT_CURVE_BORDER_WIDTH);

        // Get size of model
        const size = this.transform.get().getSize();

        // Get current number of inputs
        const inputs = this.circuit.getPortsFor(this.obj.id).length;

        // Draw line to visually match input ports
        const l1 = -(size.y/2)*(0.5-inputs/2);
        const l2 =  (size.y/2)*(0.5-inputs/2);

        const s = (size.x-DEFAULT_BORDER_WIDTH)/2;
        const p1 = V(-s, l1);
        const p2 = V(-s, l2);

        renderer.draw(new Line(p1, p2), style);
    }
}


class DigitalWireView extends BaseView<DigitalWire, DigitalCircuitController> {
    protected curve: DirtyVar<BezierCurve>;

    public constructor(circuit: CircuitController<DigitalObj>, obj: DigitalWire) {
        super(circuit, obj);

        this.curve = new DirtyVar(
            () => {
                const [port1, port2] = this.getPorts();
                const [p1, c1] = this.getCurvePoints(port1);
                const [p2, c2] = this.getCurvePoints(port2);
                return new BezierCurve(p1, p2, c1, c2);
            }
        );
    }

    public override isWithinSelectBounds(pt: Vector): boolean {
        return BezierContains(this.curve.get(), pt);
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

    protected getCurvePoints(port: DigitalPort): [Vector, Vector] {
        const { origin, target } = GetPortWorldPos(this.circuit, port);
        const dir = target.sub(origin).normalize();
        return [target, target.add(dir.scale(1))];
    }

    protected getPorts(): [DigitalPort, DigitalPort] {
        if (!this.circuit.hasObj(this.obj.p1)) {
            throw new Error("DigitalWireView: Failed to find port 1 " +
                            `[${this.obj.p1}] for ${GetDebugInfo(this.obj)}!`);
        }
        if (!this.circuit.hasObj(this.obj.p2)) {
            throw new Error("DigitalWireView: Failed to find port 2 " +
                            `[${this.obj.p2}] for ${GetDebugInfo(this.obj)}!`);
        }
        const p1 = this.circuit.getObj(this.obj.p1)!;
        const p2 = this.circuit.getObj(this.obj.p2)!;
        if (p1.baseKind !== "Port")
            throw new Error(`DigitalWireView: Received a non-port p1 for ${GetDebugInfo(this.obj)}!`);
        if (p2.baseKind !== "Port")
            throw new Error(`DigitalWireView: Received a non-port p2 for ${GetDebugInfo(this.obj)}!`);
        return [p1, p2];
    }

    protected override getBounds(): Rect {
        return this.curve.get().getBoundingBox().expand(V(WIRE_THICKNESS/2));
    }

    public override getDepth(): number {
        return -2;
    }
}


class DigitalPortView extends BaseView<DigitalPort, DigitalCircuitController> {
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

    public override isWithinSelectBounds(pt: Vector): boolean {
        return CircleContains(GetPortWorldPos(this.circuit, this.obj).target, IO_PORT_RADIUS, pt);
    }

    protected override getBounds(): Rect {
        // Bounds are the Rectangle between the points + offset from the port circle
        const pos = GetPortWorldPos(this.circuit, this.obj);
        const dir = pos.target.sub(pos.origin).normalize();
        return Rect.FromPoints(pos.origin, pos.target)
            .shift(dir, V(IO_PORT_RADIUS + IO_PORT_BORDER_WIDTH/2))
            .expand(dir.negativeReciprocal().scale(V(IO_PORT_RADIUS + IO_PORT_BORDER_WIDTH/2)));
    }

    // public override getDepth(): number {
    //     return -1;
    // }
}


// export type ViewRecord = Record<
//     DigitalObj["kind"],
//     (c: CircuitController<DigitalObj>, o: DigitalObj) => BaseView<DigitalObj, CircuitController<DigitalObj>>
// >;

export const Views: ViewRecord<DigitalObj, DigitalCircuitController> = {
    "ANDGate":     (c: DigitalCircuitController, o: ANDGate)     => new ANDGateView(c, o),
    "DigitalWire": (c: DigitalCircuitController, o: DigitalWire) => new DigitalWireView(c, o),
    "DigitalPort": (c: DigitalCircuitController, o: DigitalPort) => new DigitalPortView(c, o),
};
