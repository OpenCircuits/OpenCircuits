import {TFlipFlop} from "core/models/types/digital";

import {FlipFlopView}    from "digital/views/components/FlipFlopView";
import {DigitalViewInfo} from "digital/views/DigitalViewInfo";


export class TFlipFlopView extends FlipFlopView<TFlipFlop, DigitalViewInfo>{
    public constructor(info: DigitalViewInfo, obj: TFlipFlop) {
        super(info, obj);
    }
}
