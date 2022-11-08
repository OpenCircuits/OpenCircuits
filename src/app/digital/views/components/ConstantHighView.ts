import {DEFAULT_BORDER_COLOR, DEFAULT_BORDER_WIDTH, DEFAULT_CURVE_BORDER_WIDTH, SELECTED_BORDER_COLOR} from "core/utils/Constants";

import {V} from "Vector";

import {Rect} from "math/Rect";

import {Style} from "core/utils/rendering/Style";

import {Line} from "core/utils/rendering/shapes/Line";

import {ConstantHigh} from "core/models/types/digital";

import {RenderInfo}    from "core/views/BaseView";
import {ComponentView} from "core/views/ComponentView";

import {DigitalViewInfo} from "../DigitalViewInfo";
import { Signal } from "digital/models/sim/Signal";


export class ConstantHighView extends ComponentView<ConstantHigh, DigitalViewInfo> {
    public constructor(info: DigitalViewInfo, obj: ConstantHigh) {
        super(info, obj, V(1, 1), "constHigh.svg");
        this.info.sim.setState(this.obj, [Signal.On]);
    }

    protected override renderComponent({ renderer, selections }: RenderInfo): void {
        const selected = selections.has(this.obj.id);

        const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);

        // Get size of model
        const size = this.transform.get().getSize();
    }
}
