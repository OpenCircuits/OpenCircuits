import {DFlipFlop} from "core/models/types/digital";

import {FlipFlopView}    from "digital/views/components/FlipFlopView";
import {DigitalViewInfo} from "digital/views/DigitalViewInfo";


export class DFlipFlopView extends FlipFlopView<DFlipFlop, DigitalViewInfo> {
    public constructor(info: DigitalViewInfo, obj: DFlipFlop) {
        super(info, obj);
    }
}
