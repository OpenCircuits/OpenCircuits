import {TFlipFlop} from "core/models/types/digital";

import {FlipFlopView}    from "digital/views/components/FlipFlopView";
import {DigitalViewInfo} from "digital/views/DigitalViewInfo";

// flipflops share much of the same model. Need to get in contact with the other flipflop people, or I do all of them.
export class TFlipFlopView extends FlipFlopView<TFlipFlop, DigitalViewInfo>{
    public constructor(info: DigitalViewInfo, obj: TFlipFlop) {
        super(info, obj);
    }
}
