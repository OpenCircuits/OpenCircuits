import {DEFAULT_BORDER_COLOR, DEFAULT_BORDER_WIDTH, DEFAULT_FILL_COLOR, SELECTED_BORDER_COLOR, SELECTED_FILL_COLOR} from "core/utils/Constants";

import {V} from "Vector";

import {Style} from "core/utils/rendering/Style";

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

        const inputs = this.circuit.getPortsFor(this.obj)
            .filter((p) => p.group === "inputs").length;

        const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
        const fillCol = (selected ? SELECTED_FILL_COLOR : DEFAULT_FILL_COLOR);

        const style = new Style(fillCol, borderCol, DEFAULT_BORDER_WIDTH);

        renderer.draw(new Rectangle(V(0,0), V(1.25, inputs/2+0.5)), style);
    }
}
