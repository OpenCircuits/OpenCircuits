import {SVGDrawing} from "svg2canvas";

import {SELECTED_FILL_COLOR} from "core/utils/Constants";

import {V} from "Vector";

import {Images} from "core/utils/Images";

import {Switch} from "core/models/types/digital";

import {Signal} from "digital/models/sim/Signal";

import {RenderInfo}             from "core/views/BaseView";
import {PressableComponentView} from "core/views/PressableComponentView";

import {DigitalViewInfo} from "../DigitalViewInfo";


export class SwitchView extends PressableComponentView<Switch, DigitalViewInfo> {
    protected onImg: SVGDrawing;
    protected offImg: SVGDrawing;

    public constructor(info: DigitalViewInfo, obj: Switch) {
        super(info, obj, V(1.24, 1.54), V(0.96, 1.2));

        this.onImg  = Images.GetImage("switchDown.svg");
        this.offImg = Images.GetImage("switchUp.svg");
    }

    public override onPropChange(propKey: string): void {
        super.onPropChange(propKey);

        if (["x", "y", "angle"].includes(propKey))
            this.pressableTransform.setDirty();
    }

    // TODO: move this to a SwitchController or something?
    //  it also should be causing a propagation change, not an image change
    //  and the image will be calculated based on the propagation
    public override onClick(): void {
        this.info.sim.setState(this.obj, Signal.fromBool(!this.isOn()));
    }

    protected override drawImg({ renderer, selections }: RenderInfo): void {
        const selected = selections.has(this.obj.id);
        const tint = (selected ? SELECTED_FILL_COLOR : undefined);

        // const img = (propagator.getState(this.circuit.getPortsFor(this.obj.id)[0].id));
        const img = (this.isOn() ? this.onImg : this.offImg);
        renderer.image(img, V(), this.pressableTransform.get().getSize(), tint);
    }

    public isOn(): boolean {
        return Signal.isOn(this.info.sim.getState(this.obj) as Signal);
    }
}
