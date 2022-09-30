import {DigitalComponent} from "core/models/types/digital";

import {Signal} from "digital/utils/Signal";


export type PropagatorFunc<T extends DigitalComponent, S = unknown> = (
    (obj: T, inputs: Signal[], state?: S) =>
        ({ outputs: Signal[], nextState?: S })
)
