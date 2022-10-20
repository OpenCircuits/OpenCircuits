import {V} from "Vector";

import {JKFlipFlop} from "core/models/types/digital";

import {FlipFlopView}    from "digital/views/components/FlipFlopView";
import {DigitalViewInfo} from "digital/views/DigitalViewInfo";


export class JKFlipFlopView extends FlipFlopView<JKFlipFlop, DigitalViewInfo> {
    public constructor(info: DigitalViewInfo, obj: JKFlipFlop) {
        super(info, obj, V(2, 2.4));
    }
}
