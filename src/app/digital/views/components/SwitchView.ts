import {SVGDrawing} from "svg2canvas";

import {DEFAULT_BORDER_COLOR, DEFAULT_BORDER_WIDTH,
        SELECTED_BORDER_COLOR, SELECTED_FILL_COLOR} from "core/utils/Constants";

import {V} from "Vector";

import {Images} from "core/utils/Images";

import {Style} from "core/utils/rendering/Style";

import {Rectangle} from "core/utils/rendering/shapes/Rectangle";

import {Switch} from "core/models/types/digital";

import {RenderInfo}               from "core/views/BaseView";
import {DigitalCircuitController} from "digital/controllers/DigitalCircuitController";

import {PressableComponentView} from "../PressableComponentView";


export class SwitchView extends PressableComponentView<Switch, DigitalCircuitController> {
    protected onImg: SVGDrawing;
    protected offImg: SVGDrawing;

    protected isOn: boolean;

    public constructor(circuit: DigitalCircuitController, obj: Switch) {
        super(circuit, obj, V(1.24, 1.54), V(0.96, 1.2));

        this.onImg  = Images.GetImage("switchDown.svg");
        this.offImg = Images.GetImage("switchUp.svg");

        this.isOn = false;
    }

    public override onPropChange(propKey: string): void {
        super.onPropChange(propKey);

        if (["x", "y", "angle"].includes(propKey))
            this.pressableTransform.setDirty();
    }

    // TODO: move this to a SwitchController or something?
    //  it also should be causing a propagation change, not an image change
    //  and the image will be calculated based on the propagation
    // public onClick(): void {
    //     this.isOn = !this.isOn;
    // }

    protected override renderComponent({ renderer, selections }: RenderInfo): void {
        const selected = selections.has(this.obj.id);

        const tint      = (selected ? SELECTED_FILL_COLOR   : undefined);
        const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
        const fillCol   = (selected ? SELECTED_FILL_COLOR   : "#ffffff");
        const style = new Style(fillCol, borderCol, DEFAULT_BORDER_WIDTH);

        // Draw box behind Switch
        renderer.draw(new Rectangle(V(), this.transform.get().getSize()), style);

        // const img = (propagator.getState(this.circuit.getPortsFor(this.obj.id)[0].id));
        const img = (this.isOn ? this.onImg : this.offImg);
        renderer.image(img, V(), this.pressableTransform.get().getSize(), tint);
    }

    // public isWithinPressBounds(pt: Vector): boolean {
    //     return RectContains(this.pressableTransform.get(), pt);
    // }
}
