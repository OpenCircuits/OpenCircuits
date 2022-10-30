import {DEFAULT_BORDER_COLOR, DEFAULT_BORDER_WIDTH, DEFAULT_CURVE_BORDER_WIDTH, DEFAULT_FILL_COLOR, GATE_NOT_CIRCLE_RADIUS, SELECTED_BORDER_COLOR, SELECTED_FILL_COLOR} from "core/utils/Constants";

import {V} from "Vector";

import {Rect} from "math/Rect";

import {Style} from "core/utils/rendering/Style";

import {XNORGate} from "core/models/types/digital";

import {RenderInfo}               from "core/views/BaseView";
import {ComponentView}            from "core/views/ComponentView";
import {Circle} from "core/utils/rendering/shapes/Circle";
import {DigitalViewInfo} from "../DigitalViewInfo";
import {XORGateView} from "./XORGateView";

export class XNORGateView extends ComponentView<XNORGate, DigitalViewInfo> {
    public constructor(circuit: DigitalViewInfo, obj: XNORGate) {
        super(circuit, obj, V(1.2, 1), "or.svg");
    }

    protected override renderComponent({ renderer, selections }: RenderInfo): void {
        const selected = selections.has(this.obj.id);

        const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
        const fillCol = (selected ? SELECTED_FILL_COLOR : DEFAULT_FILL_COLOR);

        const style = new Style(fillCol, borderCol, DEFAULT_BORDER_WIDTH);

        // // Get size of model
        const size = this.transform.get().getSize();

        const l = size.x/2 + GATE_NOT_CIRCLE_RADIUS;
        renderer.draw(new Circle(V(l, 0), GATE_NOT_CIRCLE_RADIUS), style);

        // Get current number of inputs
        const inputs = this.circuit.getPortsFor(this.obj)
            .filter((p) => p.group === "inputs").length;

        //Draw curves to visually match input ports
        XORGateView.drawQuadCurve(renderer,     0, size, inputs, borderCol);
        XORGateView.drawQuadCurve(renderer, -0.24, size, inputs, borderCol);
    }

    public override getBounds(): Rect {
        // Get current number of inputs
        const inputs = this.circuit.getPortsFor(this.obj)
            .filter((p) => p.group === "inputs").length;
        return super.getBounds().expand(V(0, ((inputs-1)/2*(0.5 - DEFAULT_BORDER_WIDTH/2) + DEFAULT_BORDER_WIDTH/2)));
    }
}
