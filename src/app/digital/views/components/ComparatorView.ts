import {DEFAULT_BORDER_COLOR, DEFAULT_BORDER_WIDTH, DEFAULT_CURVE_BORDER_WIDTH, SELECTED_BORDER_COLOR} from "core/utils/Constants";

import {V} from "Vector";

import {Comparator} from "core/models/types/digital";

import {RenderInfo}    from "core/views/BaseView";
import {ComponentView} from "core/views/ComponentView";

import {DigitalViewInfo} from "../DigitalViewInfo";


export class ComparatorView extends ComponentView<Comparator, DigitalViewInfo> {
    public constructor(info: DigitalViewInfo, obj: Comparator) {
        super(info, obj, V(1, 1));
    }

    protected override renderComponent(_: RenderInfo): void {
        //
    }
}
