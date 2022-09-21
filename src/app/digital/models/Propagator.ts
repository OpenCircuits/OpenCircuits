import {Signal} from "digital/utils/Signal";

import {DigitalComponent} from "core/models/types/digital";


export type PropagatorFunc<T extends DigitalComponent, S = unknown> = (
    (obj: T, inputs: Signal[], state?: S) =>
        ({ outputs: Signal[], nextState?: S })
)
