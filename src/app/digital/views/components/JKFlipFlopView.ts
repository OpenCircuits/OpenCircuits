import {DEFAULT_BORDER_COLOR, DEFAULT_BORDER_WIDTH, DEFAULT_CURVE_BORDER_WIDTH, DEFAULT_FILL_COLOR, SELECTED_BORDER_COLOR, SELECTED_FILL_COLOR} from "core/utils/Constants";

import {V} from "Vector";

import {Rect} from "math/Rect";

import {Style} from "core/utils/rendering/Style";

import {Rectangle} from "core/utils/rendering/shapes/Rectangle";

import {JKFlipFlop} from "core/models/types/digital";

import {RenderInfo}    from "core/views/BaseView";
import {ComponentView} from "core/views/ComponentView";

import {DigitalViewInfo} from "../DigitalViewInfo";


export class JKFlipFlopView extends ComponentView<JKFlipFlop, DigitalViewInfo> {
    public constructor(info: DigitalViewInfo, obj: JKFlipFlop) {
        super(info, obj, V(2, 2.4));
    }

    protected override renderComponent({ renderer, selections }: RenderInfo): void {
        const selected = selections.has(this.obj.id);

        const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);

        const fillcol = (selected ? SELECTED_FILL_COLOR : DEFAULT_FILL_COLOR);

        const style = new Style(fillcol , borderCol, DEFAULT_CURVE_BORDER_WIDTH);

        // Get size of model
        const size = this.transform.get().getSize();

        const rect = new Rect(V(0,0), size)

        renderer.draw(new Rectangle(rect), style);
    }
}
