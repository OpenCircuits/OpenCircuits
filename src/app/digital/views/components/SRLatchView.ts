import {SRLatch} from "core/models/types/digital";
import {ComponentView} from "core/views/ComponentView";

export class ANDGateView extends ComponentView<SRLatch> {
    public constructor( obj: SRLatch) {
        super(obj);
    }
