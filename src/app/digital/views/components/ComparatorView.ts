import {DEFAULT_BORDER_COLOR, DEFAULT_BORDER_WIDTH, DEFAULT_CURVE_BORDER_WIDTH, DEFAULT_FILL_COLOR, SELECTED_BORDER_COLOR, SELECTED_FILL_COLOR} from "core/utils/Constants";

import {V} from "Vector";

import {Rect} from "math/Rect";

import {Style} from "core/utils/rendering/Style";

import {Line}      from "core/utils/rendering/shapes/Line";
import {Rectangle} from "core/utils/rendering/shapes/Rectangle";

import {Comparator} from "core/models/types/digital";

import {RenderInfo}    from "core/views/BaseView";
import {ComponentView} from "core/views/ComponentView";

import {DigitalViewInfo} from "../DigitalViewInfo";


export class ComparatorView extends ComponentView<Comparator, DigitalViewInfo> {
    public constructor(info: DigitalViewInfo, obj: Comparator) {
        super(info, obj, V(1, 1));
    }

    protected override renderComponent({ renderer, selections }: RenderInfo): void {
        const selected = selections.has(this.obj.id);

        const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
        const fillCol = (selected ? SELECTED_FILL_COLOR : DEFAULT_FILL_COLOR);

        const style = new Style(fillCol, borderCol, DEFAULT_CURVE_BORDER_WIDTH);

        const t = this.transform.get();
        renderer.draw(new Rectangle(t.getBottomLeft(), V(1.25, 2.5)), style);
    }
}
