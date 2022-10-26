import {DigitalComponent} from "core/models/types/digital";

import {Signal, SignalReducer} from "digital/models/sim/Signal";


type Propagator<C extends DigitalComponent, S> =
    (props: { c: C, signals: Record<string, Signal[]>, state?: S }) =>
        ({ nextSignals: Record<string, Signal[]>, nextState?: S });

type PropagatorRecord = {
    // The kind of every digital component
    [Comp in DigitalComponent as Comp["kind"]]:
        // Mapped to a propagator function
        Propagator<Comp, unknown>;
}

/**
 * High-order utility function to generate a simple input/output propagator function that only needs to
 *  deal with signals from `Input` ports (i.e. not `Select` ports) and `Output` ports and doesn't need
 *  any state or information from the component itself.
 *
 * @param propagator The simple propagator that takes in a list of signals and outputs a list of signals.
 * @returns            The propagator function to facilitate this propagation.
 */
const InputOutputPropagator = (propagator: (inputs: Signal[]) => Signal[]): Propagator<DigitalComponent, unknown> => (
    ({ signals }) => ({
        // Insert the new outputs into the `Output` group index
        nextSignals: {
            ...signals,
            // TODOnow: fix
            ["outputs"]: propagator(signals["inputs"]),
        },
    })
);

const Noprop: Propagator<DigitalComponent, unknown> =
    ({ signals, state }) => ({ nextSignals: signals, nextState: state });

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
    "DigitalNode": InputOutputPropagator((inputs) => (inputs)),

    // Switch has state which represents the user-defined isOn/isOff
    "Switch": ({ state = Signal.Off }) => ({
        nextSignals: { "outputs": [state as Signal] },
        nextState:   state,
    }),

    // LEDs don't propagate a signal
    "LED": Noprop,

    "ANDGate": InputOutputPropagator((inputs) => [inputs.reduce(AND)]),
};

export function Propagate<S = unknown>(c: DigitalComponent, signals: Record<string, Signal[]>, state?: S) {
    const propagator = AllPropagators[c.kind] as Propagator<DigitalComponent, S>;
    return (propagator({ c, signals, state }));
}
