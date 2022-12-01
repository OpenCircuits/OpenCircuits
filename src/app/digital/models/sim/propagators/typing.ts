// ToDo: need to be stricter
import {DigitalComponent} from "core/models/types/digital";

import {Signal} from "digital/models/sim/Signal";


export type SignalMap = Record<"inputs" | string, Signal[]>;
export type Propagator<C extends DigitalComponent> =
    (props: { c: C, signals: SignalMap, state: Signal[] }) =>
        [SignalMap, Signal[]] | [SignalMap];
export const Noprop: Propagator<DigitalComponent> = ({ signals, state }) => ([signals, state]);
