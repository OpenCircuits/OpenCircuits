import {DigitalComponent} from "core/models/types/digital";

import {Signal, SignalReducer} from "digital/models/sim/Signal";


// ToDo: need to be stricter
type SignalMap = Record<"inputs"|string, Signal[]>;
type Propagator<C extends DigitalComponent> =
    (props: { c: C, signals: SignalMap, state: Signal[] }) =>
        [SignalMap, Signal[]] | [SignalMap];

type PropagatorRecord = {
    // The kind of every digital component
    [Comp in DigitalComponent as Comp["kind"]]:
        // Mapped to a propagator function
        Propagator<Comp>;
}

const Noprop: Propagator<DigitalComponent> = ({ signals, state }) => ([signals, state]);

// AND reducer
const AND = SignalReducer((a, b) => (a && b));

// TODO
// flipflops
const DFF: ({ signals }: { signals: SignalMap }) => [SignalMap] = ({ signals }) => {
    const input = signals["inputs"];
    const sel = signals["select"];
    // split input into specific gates
    // run boolean logic

    return [signals]
}

/**
 * This is a list of all the propagators for every digital component in the circuit.
 *
 * The propagator is a function that takes in the current component, set of inputs, and state
 *  and returns the computed outputs and next state based on the inputs.
 *
 * The "state" is a generic variable that can be whatever we want. This is specifically used in the case of
 *  FlipFlops which need to have their current state as a stored internal value.
 */
export const AllPropagators: PropagatorRecord = {
    "DigitalNode": ({ signals }) => [{ "outputs": signals["inputs"] }],

    // Switch has state which represents the user-defined isOn/isOff
    "Switch": ({ state = [Signal.Off] }) => [{ "outputs": state }, state],

    // LEDs don't propagate a signal
    "LED": Noprop,

    "ANDGate": ({ signals }) => [{ "outputs": [signals["inputs"].reduce(AND)] }],

     // ToDo: Add prop here later
     "DFlipFlop":  DFF,
     "TFlipFlop":  Noprop,
     "JKFlipFlop": Noprop,
     "SRFlipFlop": Noprop,
};

export function Propagate(c: DigitalComponent, signals: Record<string, Signal[]>, state: Signal[]) {
    const propagator = AllPropagators[c.kind] as Propagator<DigitalComponent>;
    return (propagator({ c, signals, state }));
}
