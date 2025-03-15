import {Schema} from "shared/api/circuit/schema";
import {Signal} from "./Signal";


export type PropagatorFunc = (obj: Schema.Component, signals: Record<string, Signal[]>, state?: Signal[]) => {
    outputs: Record<string, Signal[]>;
    nextState?: Signal[];
};

// export interface PropagatorInfo {
//     initialState?: Signal[];
//     initialSignals: Record<string, Signal[]>;  // Port group -> port at index signals (only for output port)
// }

// Kind : Propagator
export type PropagatorsMap = Record<string, PropagatorFunc>;

function MakeGatePropagators(func: (inputs: Signal[]) => Signal): [PropagatorFunc, PropagatorFunc] {
    return [
        (_obj, signals, _state) => ({ outputs: { "outputs": [func(signals["inputs"])] } }),
        (_obj, signals, _state) => ({ outputs: { "outputs": [Signal.invert(func(signals["inputs"]))] } }),
    ]
}
const [BUFGate, NOTGate] = MakeGatePropagators((inputs) => inputs[0]);
const [ANDGate, NANDGate] = MakeGatePropagators((inputs) => (
    inputs.some(Signal.isOff)
    ? Signal.Off
    : inputs.some(Signal.isMetastable)
    ? Signal.Metastable
    : Signal.On
));
const [ORGate, NORGate] = MakeGatePropagators((inputs) => (
    inputs.some(Signal.isOn)
    ? Signal.On
    : inputs.some(Signal.isMetastable)
    ? Signal.Metastable
    : Signal.Off
));
const [XORGate, XNORGate] = MakeGatePropagators((inputs) => (
    inputs.some(Signal.isMetastable)
    ? Signal.Metastable
    // We use the "isOdd" definition for N>2 XOR Gates
    // https://electronics.stackexchange.com/a/190670 being my favorite justification
    // being, "that's how Verilog does it"
    // It also provides associativity and is equivalent to chaining XOR Gates.
    : inputs.filter(Signal.isOn).length % 2 === 1
    ? Signal.On
    : Signal.Off
));

function MakeLatchPropagator(getState: (signals: Record<string, Signal[]>, state: Signal) => Signal): PropagatorFunc {
    return (_obj, signals, state = [Signal.Off]) => {
        const [curState] = state, [E] = signals["E"];

        const nextState = (() => {
            if (Signal.isOff(E))
                return curState;
            return getState(signals, curState);
        })();
        return {
            outputs: {
                "Q":    [nextState],
                "Qinv": [Signal.invert(nextState)],
            },
            nextState: [nextState],
        }
    };
}
const DLatch = MakeLatchPropagator((signals, _state) => (signals["D"][0]));
const SRLatch = MakeLatchPropagator((signals, state) => {
    const [S] = signals["S"], [R] = signals["R"];

    if (!Signal.isOff(S) && !Signal.isOff(R)) {
        return Signal.Metastable;
    } else if (!Signal.isOff(S)) {
        return Signal.On;
    } else if (!Signal.isOff(R)) {
        return Signal.Off;
    }
    return state;
});

export const DigitalPropagators: PropagatorsMap = {
    "Switch": (_obj, _signals, state = [Signal.Off]) => ({
        outputs: {
            "outputs": [state[0]],
        },
        nextState: state,
    }),
    "LED": (_obj, _signals, _state) => ({
        outputs: {},
    }),
    // Gates
    BUFGate, NOTGate,
    ANDGate, NANDGate,
    ORGate, NORGate,
    XORGate, XNORGate,
    // FlipFlosp

    // Latches
    DLatch, SRLatch,
}
