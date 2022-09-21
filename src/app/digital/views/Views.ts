import {DEFAULT_BORDER_COLOR, DEFAULT_BORDER_WIDTH, DEFAULT_CURVE_BORDER_WIDTH, DEFAULT_FILL_COLOR, IO_PORT_BORDER_WIDTH, IO_PORT_LINE_WIDTH, IO_PORT_RADIUS, SELECTED_BORDER_COLOR, SELECTED_FILL_COLOR} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {Rect}      from "math/Rect";
import {Transform} from "math/Transform";

import {GetDebugInfo} from "core/utils/Debug";

import {Style} from "core/utils/rendering/Style";

import {Circle} from "core/utils/rendering/shapes/Circle";
import {Line}   from "core/utils/rendering/shapes/Line";

import {ANDGate, DigitalComponent, DigitalObj, DigitalPort, DigitalWire} from "core/models/types/digital";

import {CircuitController}    from "core/controllers/CircuitController";
import {BaseView, RenderInfo} from "core/views/BaseView";
import {ComponentView}        from "core/views/ComponentView";
import {PortInfo}             from "core/views/PortInfo";
import {ViewRecord}           from "core/views/ViewManager";




type DigitalCircuitController = CircuitController<DigitalObj>;


class ANDGateView extends ComponentView<ANDGate, DigitalCircuitController> {
    public constructor(circuit: CircuitController<DigitalObj>, obj: ANDGate) {
        super(circuit, obj, V(1, 1), "and.svg");
    }

    protected override renderComponent({ renderer }: RenderInfo): void {
        const selected = false; // selections.has(this.obj);

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


class DigitalPortView extends BaseView<DigitalPort, DigitalCircuitController> {
    protected override renderInternal({ renderer }: RenderInfo): void {
        const parentSelected = false; // selections.has(this.obj.parent);
        const selected = false; // selections.has(this.obj);

        const { origin, target } = this.getWorldPos();

        const lineCol       = (parentSelected && !selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
        const borderCol     = (parentSelected ||  selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
        const circleFillCol = (parentSelected ||  selected ? SELECTED_FILL_COLOR   : DEFAULT_FILL_COLOR);
        const lineStyle   = new Style(undefined, lineCol, IO_PORT_LINE_WIDTH);
        const circleStyle = new Style(circleFillCol, borderCol, IO_PORT_BORDER_WIDTH);

        renderer.draw(new Line(origin, target), lineStyle);
        renderer.draw(new Circle(target, IO_PORT_RADIUS), circleStyle);
    }

    protected getParent(): DigitalComponent {
        if (!this.circuit.hasObject(this.obj.parent)) {
            throw new Error("DigitalPortView: Failed to find parent " +
                            `[${this.obj.parent}] for ${GetDebugInfo(this.obj)}!`);
        }
        const parent = this.circuit.getObject(this.obj.parent)!;
        if (parent.baseKind !== "Component")
            throw new Error(`DigitalPortView: Received a non-component parent for ${GetDebugInfo(this.obj)}!`);
        return parent;
    }

    protected getWorldPos() {
        const parent = this.getParent();
        const pos = this.getPos();
        return {
            origin: pos.origin.rotate(parent.angle).add(V(parent.x, parent.y)),
            target: pos.target.rotate(parent.angle).add(V(parent.x, parent.y)),
        };
    }

    protected getGroupingID() {
        const parent = this.getParent();
        const ports = this.circuit.getPortsFor(parent.id);
        // Grouping IDs are comma separated strings of the number
        //  of ports in each `group` for a specific component
        return ports.reduce(
            // Count each group
            (arr, { group }) => {
                arr[group] = ((arr[group] ?? 0) + 1);
                return arr;
            },
            [] as number[]
        ).join(",");
    }

    protected getPos() {
        const grouping = this.getGroupingID();
        return PortInfo[this.getParent().kind][grouping][`${this.obj.group}:${this.obj.index}`];
    }

    protected override getBounds(): Rect {
        // Bounds are the Rectangle between the points + offset from the port circle
        const pos = this.getWorldPos();
        const dir = pos.target.sub(pos.origin).normalize();
        return Rect.FromPoints(pos.origin, pos.target)
            .shift(dir, V(IO_PORT_RADIUS + IO_PORT_BORDER_WIDTH/2))
            .expand(dir.negativeReciprocal().scale(V(IO_PORT_RADIUS + IO_PORT_BORDER_WIDTH/2)));
    }
}


// export type ViewRecord = Record<
//     DigitalObj["kind"],
//     (c: CircuitController<DigitalObj>, o: DigitalObj) => BaseView<DigitalObj, CircuitController<DigitalObj>>
// >;

export const Views: ViewRecord<DigitalObj, DigitalCircuitController> = {
    "ANDGate":     (c: DigitalCircuitController, o: ANDGate)     => new ANDGateView(c, o),
    "DigitalWire": (c: DigitalCircuitController, o: DigitalWire) => { throw new Error("Unimplemented"); },
    "DigitalPort": (c: DigitalCircuitController, o: DigitalPort) => new DigitalPortView(c, o),
};
