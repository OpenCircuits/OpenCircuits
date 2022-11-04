import {DEFAULT_BORDER_COLOR, DEFAULT_BORDER_WIDTH, DEFAULT_FILL_COLOR, GATE_NOT_CIRCLE_RADIUS, IO_PORT_BORDER_WIDTH, IO_PORT_LINE_WIDTH, IO_PORT_RADIUS, IO_PORT_SELECT_RADIUS, SELECTED_BORDER_COLOR, SELECTED_FILL_COLOR} from "core/utils/Constants";

import {V} from "Vector";

import {Style} from "core/utils/rendering/Style";

import {Circle} from "core/utils/rendering/shapes/Circle";
import {Line}   from "core/utils/rendering/shapes/Line";

import {AnyPort} from "core/models/types";

import {DigitalPort} from "core/models/types/digital";

import {RenderInfo} from "core/views/BaseView";
import {PortView}   from "core/views/PortView";

import {DigitalViewInfo} from "./DigitalViewInfo";



export class DigitalPortView extends PortView<DigitalPort, DigitalViewInfo> {
    public override isWireable(): boolean {
        // Output ports always can have new connections
        if (this.obj.group === "outputs") // TODOnow: fix
            return true;
        // Input and select ports can only have new connections if they don't already have any
        const wires = this.circuit.getWiresFor(this.obj);
        return (wires.length === 0);
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

        if (this.circuit.getPortParent(this.obj).kind === "NOTGate" && this.obj.group === "outputs"){
            const l = origin.x + GATE_NOT_CIRCLE_RADIUS + 0.05;
            const notCircleStyle = new Style(circleFillCol, borderCol, DEFAULT_BORDER_WIDTH);
            renderer.draw(new Circle(V(l, origin.y), GATE_NOT_CIRCLE_RADIUS), notCircleStyle);
        }
    }

    public override isWireableWith(p: AnyPort): boolean {
        return (
            // We can wire it with `p` if we are an output port and they are an input/select port
            //  or we are an input/select port and they are an output port
            (this.obj.group === "outputs" && (p.group !== "outputs")) ||  // TODOnow: fix
            (this.obj.group !== "outputs" && (p.group === "outputs"))     // TODOnow: fix
        );
    }
}
