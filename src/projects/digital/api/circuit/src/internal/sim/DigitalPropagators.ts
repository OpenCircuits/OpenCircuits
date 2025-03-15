import {Schema} from "shared/api/circuit/schema";
import {Signal} from "./Signal";
import {BCDtoDecimal, DecimalToBCD} from "../../utils/MathUtil";


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

function MakeNoOutputPropagator(): PropagatorFunc {
    return (_obj: Schema.Component, _ignals: Record<string, Signal[]>, _state?: Signal[]) => ({
        outputs: {},
    });
}

function MakeSingleOutputPropagator(
    getOutput: (obj: Schema.Component, signals: Record<string, Signal[]>, state?: Signal[]) => {
        signal: Signal;
        nextState?: Signal[];
    },
): PropagatorFunc {
    return (obj: Schema.Component, signals: Record<string, Signal[]>, state?: Signal[]) => {
        const { signal, nextState } = getOutput(obj, signals, state);
        return {
            outputs: { "outputs": [signal] },
            nextState,
        };
    }
}
function MakeStatelessSingleOutputPropagator(
    getOutput: (obj: Schema.Component, signals: Record<string, Signal[]>, state?: Signal[]) => Signal,
): PropagatorFunc {
    return MakeSingleOutputPropagator((obj, signals, state) => ({
        signal: getOutput(obj, signals, state),
    }));
}

function MakeGatePropagators(func: (inputs: Signal[]) => Signal): [PropagatorFunc, PropagatorFunc] {
    return [
        MakeStatelessSingleOutputPropagator((_obj, signals, _state) => func(signals["inputs"])),
        MakeStatelessSingleOutputPropagator((_obj, signals, _state) => Signal.invert(func(signals["inputs"]))),
    ];
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

function MakeFlipFlopPropagator(
    getState: (signals: Record<string, Signal[]>, state: Signal, up: boolean) => Signal,
): PropagatorFunc {
    return (_obj, signals, state = [Signal.Off, Signal.Off]) => {
        const [curState, prevClk] = state, [CLK] = signals["clk"], [PRE] = signals["pre"], [CLR] = signals["clr"];

        const up = (Signal.isOff(prevClk) && !Signal.isOff(CLK));

        const nextState = (() => {
            // If PRE or CLR are set, then don't care about data or clock since asynchronous
            if (!Signal.isOff(PRE) && !Signal.isOff(CLR)) {
                // undefined
                return Signal.Metastable;
            } else if (!Signal.isOff(PRE)) {
                return Signal.On;
            } else if (!Signal.isOff(CLR)) {
                return Signal.Off;
            }
            return getState(signals, curState, up);
        })();

        return {
            outputs: {
                "Q":    [nextState],
                "Qinv": [Signal.invert(nextState)],
            },
            nextState: [nextState, CLK],
        }
    };
}
const DFlipFlop = MakeFlipFlopPropagator((signals, state, up) => (up ? signals["D"][0] : state));
const JKFlipFlop = MakeFlipFlopPropagator((signals, state, up) => {
    const [J] = signals["J"], [K] = signals["K"];
    if (up) {
        if (!Signal.isOff(J) && !Signal.isOff(K))
            return Signal.invert(state);
        else if (!Signal.isOff(J))
            return Signal.On;
        else if (!Signal.isOff(K))
            return Signal.Off;
    }
    return state;
});
const SRFlipFlop = MakeFlipFlopPropagator((signals, state, up) => {
    const [S] = signals["S"], [R] = signals["R"];
    if (up) {
        if (!Signal.isOff(S) && !Signal.isOff(R))
            return Signal.Metastable; // undefined
        else if (!Signal.isOff(S))
            return Signal.On;
        else if (!Signal.isOff(R))
            return Signal.Off;
    }
    return state;
});
const TFlipFlop = MakeFlipFlopPropagator((signals, state, up) =>
    (up && !Signal.isOff(signals["T"][0]) ? Signal.invert(state) : state));


export const DigitalPropagators: PropagatorsMap = {
    // Node
    "DigitalNode": BUFGate,  // Acts like a buffer

    // Inputs
    "Switch": MakeSingleOutputPropagator((_obj, _signals, state = [Signal.Off]) => ({
        signal:    state[0],
        nextState: state,
    })),
    "Button": MakeSingleOutputPropagator((_obj, _signals, state = [Signal.Off]) => ({
        signal:    state[0],
        nextState: state,
    })),
    "ConstantLow":    MakeStatelessSingleOutputPropagator((_obj, _signals, _state) => Signal.Off),
    "ConstantHigh":   MakeStatelessSingleOutputPropagator((_obj, _signals, _state) => Signal.On),
    "ConstantNumber": (obj, _signals, _state) => {
        // TODO: Figure out how to update propagation when this changes
        const num = obj.props["inputNum"] as number ?? 0;
        return { outputs: { "outputs": DecimalToBCD(num, 4).map(Signal.fromBool) } };
    },
    "Clock": MakeSingleOutputPropagator((_obj, _signals, state = [Signal.Off]) => ({
        signal:    state[0],  // TODO: update this state periodically somehow
        nextState: state,
    })),

    // Outputs
    "LED":            MakeNoOutputPropagator(),
    "SegmentDisplay": MakeNoOutputPropagator(),
    "BCDDisplay":     MakeNoOutputPropagator(),
    "ASCIIDisplay":   MakeNoOutputPropagator(),
    "Oscilloscope":   MakeNoOutputPropagator(),

    // Gates
    BUFGate, NOTGate,
    ANDGate, NANDGate,
    ORGate, NORGate,
    XORGate, XNORGate,

    // FlipFlops
    SRFlipFlop, JKFlipFlop,
    DFlipFlop, TFlipFlop,

    // Latches
    DLatch, SRLatch,

    // Other
    "Multiplexer": MakeStatelessSingleOutputPropagator((_obj, signals, _state) => (
        // TODO: Handle metastable
        signals["inputs"][BCDtoDecimal(signals["selects"].map(Signal.toBool))]
    )),
    "Demultiplexer": (_obj, signals, _state) => {
        // TODO: Handle metastable
        const selects = signals["selects"].map(Signal.toBool);
        return { outputs: {
            "outputs": new Array<Signal>(Math.pow(2, selects.length))
                // All ports should be off except the selected one should === the input signal
                .fill(Signal.Off)
                .with(BCDtoDecimal(selects), signals["inputs"][0]),
        } };
    },
    "Encoder": (_obj, signals, _state) => {
        const inputs = signals["inputs"];
        const outputCount = Math.round(Math.log2(inputs.length));

        // Undefined behavior
        if (inputs.count(Signal.isOn) !== 1 || inputs.count(Signal.isMetastable) > 0) {
            return { outputs: {
                "outputs": new Array<Signal>(outputCount).fill(Signal.Metastable),
            } };
        }

        const num = inputs.indexOf(Signal.On);
        return { outputs: {
            "outputs": DecimalToBCD(num, outputCount).map(Signal.fromBool),
        } };
    },
    "Decoder": (_obj, signals, _state) => {
        // TODO: Handle metastable
        const inputs = signals["inputs"].map(Signal.toBool);
        return { outputs: {
            "outputs": new Array<Signal>(Math.pow(2, inputs.length))
                // All ports should be off except the selected one should be On
                .fill(Signal.Off)
                .with(BCDtoDecimal(inputs), Signal.Off),
        } };
    },
    "Comparator": (_obj, signals, _state) => {
        // TODO: Handle metastable
        const a = BCDtoDecimal(signals["inputsA"].map(Signal.toBool));
        const b = BCDtoDecimal(signals["inputsB"].map(Signal.toBool));
        return { outputs: {
            "lt": [a < b   ? Signal.On : Signal.Off],
            "eq": [a === b ? Signal.On : Signal.Off],
            "gt": [a > b   ? Signal.On : Signal.Off],
        } };
    },
    "Label": MakeNoOutputPropagator(),
}
