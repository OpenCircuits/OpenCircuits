import {DEFAULT_BORDER_COLOR, DEFAULT_BORDER_WIDTH, DEFAULT_CURVE_BORDER_WIDTH, SELECTED_BORDER_COLOR} from "core/utils/Constants";

import {V} from "Vector";

import {BUFGate} from "core/models/types/digital";

import {ComponentView} from "core/views/ComponentView";

import {DigitalViewInfo} from "../DigitalViewInfo";


export class BUFGateView extends ComponentView<BUFGate, DigitalViewInfo> {
    public constructor(circuit: DigitalViewInfo, obj: BUFGate) {
        super(circuit, obj, V(1, 1), "buf.svg");
    }
}
