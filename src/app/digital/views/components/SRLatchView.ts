import {SRLatch} from "core/models/types/digital";
import {ComponentView} from "core/views/ComponentView";

import {V} from "Vector";
import {DigitalViewInfo} from "../DigitalViewInfo";

export class SRLatchView extends ComponentView<SRLatch, DigitalViewInfo> {
    public constructor(info: DigitalViewInfo, obj: SRLatch) {
        super(info, obj);
    }

}export const ComponentRenderer = (() => {

    const drawBox = function(renderer:, transform: , selected: boolean, fillcol = ): void {
        const borderCol = (selected ?  : );
        const fillCol   = (selected ? : );
        const style = new Style(fillCol, borderCol, DEFAULT_BORDER_WIDTH);
        renderer.draw(new Rectangle(V(), transform.getSize()), style);
    }
