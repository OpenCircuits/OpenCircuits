import {DigitalComponent} from "core/models/types/digital";

import {Signal, SignalReducer} from "digital/models/sim/Signal";


type Propagator<C extends DigitalComponent> =
    (props: { c: C, signals: Record<string, Signal[]>, state: Signal[] }) =>
        [Record<string, Signal[]>, Signal[]] | [Record<string, Signal[]>];

type PropagatorRecord = {
    // The kind of every digital component
    [Comp in DigitalComponent as Comp["kind"]]:
        // Mapped to a propagator function
        Propagator<Comp>;
}

const Noprop: Propagator<DigitalComponent> = ({ signals, state }) => ([signals, state]);

// AND reducer
const AND = SignalReducer((a, b) => (a && b));

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

    "Comparator": ({ signals }) => {
        let a = 0, b = 0;
        const len = signals["inputsA"].length;
        for (let i = 0; i < len; i += 1) {
            a += signals["inputsA"][i] * Math.pow(2, i);
            b += signals["inputsB"][i] * Math.pow(2, i);
        }
        if (a > b){
            return [{ "outputs": [Signal.fromBool(false), Signal.fromBool(false), Signal.fromBool(true)] }];
        }
        else if (a < b){
            return [{ "outputs": [Signal.fromBool(false), Signal.fromBool(true), Signal.fromBool(false)] }];
        }
        return [{ "outputs": [Signal.fromBool(true), Signal.fromBool(false), Signal.fromBool(false)] }];
    },
};

export function Propagate(c: DigitalComponent, signals: Record<string, Signal[]>, state: Signal[]) {
    const propagator = AllPropagators[c.kind] as Propagator<DigitalComponent>;
    return (propagator({ c, signals, state }));
}
