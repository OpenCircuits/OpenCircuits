import {V} from "Vector";

import {SRFlipFlop} from "core/models/types/digital";

import {FlipFlopView}    from "digital/views/components/FlipFlopView";
import {DigitalViewInfo} from "digital/views/DigitalViewInfo";


export class SRFlipFlopView extends FlipFlopView<SRFlipFlop, DigitalViewInfo> {
    public constructor(info: DigitalViewInfo, obj: SRFlipFlop) {
        super(info, obj, V(2, 2.4));
    }
}
