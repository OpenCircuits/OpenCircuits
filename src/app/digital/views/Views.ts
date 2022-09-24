import {Color, blend, parseColor} from "svg2canvas";

import {DEFAULT_BORDER_COLOR, DEFAULT_BORDER_WIDTH, DEFAULT_CURVE_BORDER_WIDTH, DEFAULT_FILL_COLOR, IO_PORT_BORDER_WIDTH, IO_PORT_LINE_WIDTH, IO_PORT_RADIUS, IO_PORT_SELECT_RADIUS, SELECTED_BORDER_COLOR, SELECTED_FILL_COLOR, WIRE_THICKNESS} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {BezierCurve}                                  from "math/BezierCurve";
import {BezierContains, CircleContains, RectContains} from "math/MathUtils";
import {Rect}                                         from "math/Rect";
import {Transform}                                    from "math/Transform";

import {GetDebugInfo} from "core/utils/Debug";
import {DirtyVar}     from "core/utils/DirtyVar";

import {Style} from "core/utils/rendering/Style";

import {Circle} from "core/utils/rendering/shapes/Circle";
import {Curve}  from "core/utils/rendering/shapes/Curve";
import {Line}   from "core/utils/rendering/shapes/Line";

import {AllInfo} from "core/models/info";
import {AnyPort} from "core/models/types";

import {ANDGate, DigitalComponent, DigitalObj, DigitalPort, DigitalPortGroup, DigitalWire} from "core/models/types/digital";

import {CircuitController}                             from "core/controllers/CircuitController";
import {BaseView, RenderInfo}                          from "core/views/BaseView";
import {ComponentView}                                 from "core/views/ComponentView";
import {CalcPortGroupingID, GetPortWorldPos, PortInfo} from "core/views/PortInfo";
import {PortView}                                      from "core/views/PortView";
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

    public override contains(pt: Vector): boolean {
        return BezierContains(this.curve.get(), pt);
    }
    public override isWithinBounds(bounds: Transform): boolean {
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

    public override getMidpoint(): Vector {
        return this.curve.get().getPos(0.5);
    }

    protected override getBounds(): Rect {
        return this.curve.get().getBoundingBox().expand(V(WIRE_THICKNESS/2));
    }

    public override getDepth(): number {
        return -2;
    }
}

class DigitalPortView extends PortView<DigitalPort, DigitalCircuitController> {
    public override isWireable(): boolean {
        // Output ports always can have new connections
        if (this.obj.group === DigitalPortGroup.Output)
            return true;
        // Input and select ports can only have new connections if they don't already have any
        const wires = this.circuit.getWiresFor(this.obj.id);
        return (wires.length === 0);
    }

    public override isWireableWith(p: AnyPort): boolean {
        return (
            // We can wire it with `p` if we are an output port and they are an input/select port
            //  or we are an input/select port and they are an output port
            (this.obj.group === DigitalPortGroup.Output && (p.group !== DigitalPortGroup.Output)) ||
            (this.obj.group !== DigitalPortGroup.Output && (p.group === DigitalPortGroup.Output))
        );
    }
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
