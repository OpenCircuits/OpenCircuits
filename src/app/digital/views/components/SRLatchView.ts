import {DEFAULT_BORDER_COLOR, DEFAULT_BORDER_WIDTH, SELECTED_BORDER_COLOR} from "core/utils/Constants";
import {SRLatch} from "core/models/types/digital";
import {ComponentView} from "core/views/ComponentView";

import {V} from "Vector";
import {DigitalViewInfo} from "../DigitalViewInfo";

export class SRLatchView extends ComponentView<SRLatch, DigitalViewInfo> {
    public constructor(info: DigitalViewInfo, obj: SRLatch) {
        super(info, obj);
    }

    const drawBox = function(renderer: , transform: , selected: boolean, fillcol = ): void {
        const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
        const fillCol   = (selected ?  SELECTED_FILL_COLOR : typeof fillcol)
        const style = new Style(fillCol, borderCol, DEFAULT_BORDER_WIDTH);
        renderer.draw(new Shape(V(), transform.getSize()), style);
    }
}
