import {SRLatch} from "core/models/types/digital";
import {ComponentView} from "core/views/ComponentView";

import {V} from "Vector";
import {DigitalViewInfo} from "../DigitalViewInfo";

export class SRLatchView extends ComponentView<SRLatch, DigitalViewInfo> {
    public constructor(info: DigitalViewInfo, obj: SRLatch) {
        super(info, obj, V(1, 1), "and.svg");
    }
}