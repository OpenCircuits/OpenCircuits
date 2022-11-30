// here only to match pattern for every other presumed prop
import {SignalReducer} from "digital/models/sim/Signal";

export const AND = SignalReducer((a, b) => (a && b));