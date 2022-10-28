/* eslint-disable unicorn/filename-case */
import {DEFAULT_BORDER_COLOR, DEFAULT_BORDER_WIDTH, DEFAULT_CURVE_BORDER_WIDTH, SELECTED_BORDER_COLOR} from "core/utils/Constants";

import {V} from "Vector";

import {NOTGate} from "core/models/types/digital";

import {ComponentView} from "core/views/ComponentView";

import {DigitalViewInfo} from "../DigitalViewInfo";


export class NOTGateView extends ComponentView<NOTGate, DigitalViewInfo> {
    public constructor(info: DigitalViewInfo, obj: NOTGate) {
        super(info, obj, V(1, 1), "buf.svg");
    }
}
