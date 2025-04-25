import {Schema} from "shared/api/circuit/schema";
import {Signal} from "./Signal";
import {BCDtoDecimal, DecimalToBCD} from "../../utils/MathUtil";
import {PropagatorInfo, PropagatorsMap} from "./DigitalSim";


type LocalPropagatorFunc = (obj: Schema.Component, signals: Record<string, Signal[]>, state?: Signal[], tickInfo?: { curTick: number, lastStateTick?: number }) => {
    outputs: Record<string, Signal[]>;
    nextState?: Signal[];
    nextCycle?: number;
};

function MakeLocalPropagator(func: LocalPropagatorFunc, stateProps?: string[]): PropagatorInfo {
    return {
        propagator: (comp, info, state, tickInfo) => {
            const ports = state.getPortsByGroup(comp.id);

            // Get signals from each input port and put it in a record of group: signals[]
            const inputSignals = Object.fromEntries(
                info.inputPortGroups.map((group) =>
                    [group, ports[group].map((id) => (state.signals.get(id) ?? Signal.Off))]));
            const compState = state.states.get(comp.id);

            const { outputs, nextState, nextCycle } = func(comp, inputSignals, compState, tickInfo);

            // Maybe check this?
            // for (const [group, signals] of Object.entries(outputs)) {
            //     if (!info.outputPortGroups.includes(group)) {
            //         throw new Error(`DigitalSim.step: Propagator for '${comp.kind}' returned ` +
            //                         `a signal for group '${group}' which is not an output port!`);
            //     }
            // }

            // [group: signal[]] -> [portId -> signal][]
            return {
                outputs: new Map(
                    Object.entries(outputs)
                        .flatMap(([group, signals]) =>
                            signals.map((s, i) => [state.getPath(ports[group][i]), s] as const))
                ),
                nextState,
                nextCycle,
            };
        },
        stateProps: new Set(stateProps),
    };
}

function MakeNoOutputPropagator() {
    return MakeLocalPropagator((_obj, _signals, _state) => ({
        outputs: {},
    }));
}

function MakeSingleOutputPropagator(
    getOutput: (obj: Schema.Component, signals: Record<string, Signal[]>, state?: Signal[], tickInfo?: { curTick: number, lastStateTick?: number }) => {
        signal: Signal;
        nextState?: Signal[];
        nextCycle?: number;
    },
    stateProps?: string[],
) {
    return MakeLocalPropagator((obj, signals, state, tickInfo) => {
        const { signal, nextState, nextCycle } = getOutput(obj, signals, state, tickInfo);
        return {
            outputs: { "outputs": [signal] },
            nextState,
            nextCycle,
        };
    }, stateProps);
}
function MakeStatelessSingleOutputPropagator(
    getOutput: (obj: Schema.Component, signals: Record<string, Signal[]>, state?: Signal[]) => Signal,
) {
    return MakeSingleOutputPropagator((obj, signals, state) => ({
        signal: getOutput(obj, signals, state),
    }));
}

function MakeGatePropagators(func: (inputs: Signal[]) => Signal) {
    return [
        MakeStatelessSingleOutputPropagator((_obj, signals, _state) => func(signals["inputs"])),
        MakeStatelessSingleOutputPropagator((_obj, signals, _state) => Signal.invert(func(signals["inputs"]))),
    ] as const;
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
    // of: "that's how Verilog does it"
    // It also provides associativity and is equivalent to chaining XOR Gates.
    : inputs.filter(Signal.isOn).length % 2 === 1
    ? Signal.On
    : Signal.Off
));

function MakeLatchPropagator(getState: (signals: Record<string, Signal[]>, state: Signal) => Signal) {
    return MakeLocalPropagator((_obj, signals, state = [Signal.Off]) => {
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
    });
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
) {
    return MakeLocalPropagator((_obj, signals, state = [Signal.Off, Signal.Off]) => {
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
    });
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
    "InputPin": {
        // TODO[] - simplify this at some point
        propagator: (comp, _info, state) => {
            // No propagation when not in an IC
            if (!state.isIC())
                return { outputs: new Map() };

            const outputPort = state.getPortsByGroup(comp.id)["outputs"][0];

            const pin = state.storage.metadata.pins.find((pin) => (pin.id === outputPort));
            if (!pin)
                throw new Error(`DigitalSim.InputPin.propagate: Failed to find pin for input pin ${comp.id}!`);
            const pinIndex = state.storage.metadata.pins.filter((p) => p.group === pin.group).indexOf(pin);

            const icInstanceId = state["prePath"].at(-1)!, superState = state.superState!;

            const inputPort = [...superState.storage.getPortsForGroup(icInstanceId, pin.group).unwrap()]
                .map((p) => superState.storage.getPortByID(p).unwrap())
                .find((port) => (port.index === pinIndex))!;

            return {
                "outputs": new Map([
                    // Output the input signal
                    [state.getPath(outputPort), superState.signals.get(inputPort.id) ?? Signal.Off],
                ]),
            };
        },
    },
    "OutputPin": {
        propagator: (comp, _info, state) => {
            // No propagation when not in an IC
            if (!state.isIC())
                return { outputs: new Map() };

            const inputPort = state.getPortsByGroup(comp.id)["inputs"][0];

            const pin = state.storage.metadata.pins.find((pin) => (pin.id === inputPort));
            if (!pin)
                throw new Error(`DigitalSim.InputPin.propagate: Failed to find pin for input pin ${comp.id}!`);
            const pinIndex = state.storage.metadata.pins.filter((p) => p.group === pin.group).indexOf(pin);

            const icInstanceId = state["prePath"].at(-1)!, superState = state.superState!;

            // "Output port" is the IC instance's EXTERNAL output port
            const outputPort = [...superState.storage.getPortsForGroup(icInstanceId, pin.group).unwrap()]
                .map((p) => superState.storage.getPortByID(p).unwrap())
                .find((port) => (port.index === pinIndex))!;

            return {
                "outputs": new Map([
                    // Output the input signal
                    [superState.getPath(outputPort.id), state.signals.get(inputPort) ?? Signal.Off],
                ]),
            };
        },
    },

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
    "ConstantNumber": MakeLocalPropagator((obj, _signals, _state) => {
        const num = obj.props["inputNum"] as number ?? 0;
        return { outputs: { "outputs": DecimalToBCD(num, 4).map(Signal.fromBool) } };
    }, ["inputNum"]),
    "Clock": MakeLocalPropagator((obj, _signals, [curSignal] = [Signal.On], tickInfo) => {
        const { curTick, lastStateTick } = tickInfo!;
        const delay = (obj.props["delay"] as number) ?? 250;
        if ((curTick - (lastStateTick ?? curTick)) % delay !== 0)
            return { outputs: { "outputs": [] } };
        return ({
            outputs:   { "outputs": [curSignal] },
            nextState: [Signal.invert(curSignal)],
            nextCycle: delay,
        });
    }, ["delay"]),

    // Outputs
    "LED":            MakeNoOutputPropagator(),
    "SegmentDisplay": MakeNoOutputPropagator(),
    "BCDDisplay":     MakeNoOutputPropagator(),
    "ASCIIDisplay":   MakeNoOutputPropagator(),
    "Oscilloscope":   MakeLocalPropagator((obj, signals, state = [], tickInfo) => {
        const { curTick, lastStateTick } = tickInfo!;
        const maxSamples = (obj.props["samples"] as number) ?? 100;
        const delay = (obj.props["delay"] as number) ?? 50;
        // const numInputs = signals["inputs"].length;

        if ((curTick - (lastStateTick ?? curTick)) % delay !== 0)
            return { outputs: {} };

        const nextSignals = new Array<Signal>(8).fill(Signal.Off);
        signals["inputs"].forEach((val, i) => nextSignals[i] = val);
        return {
            outputs:   {},
            nextState: [...(state.length >= (maxSamples - 1)*8 ? state.slice(8) : state), ...nextSignals],
            nextCycle: delay,
        };
    }, []),
    // "Oscilloscope":   MakeLocalPropagator((obj, signals, state = [Signal.On, Signal.Off, Signal.Off]) => {
    //     // First 3 bits are BCD representing the current number of inputs that the rest of state is holding
    //     // This is required because we can't know when the number of ports changed
    //     const [a, b, c, ...states] = state;
    //     const curNumInputs = BCDtoDecimal([a, b, c].map(Signal.toBool));

    //     const maxSamples = (obj.props["samples"] as number) ?? 100;
    //     const numInputs = signals["inputs"].length;
    //     const delay = (obj.props["delay"] as number) ?? 50;

    //     let curStates = states.chunk(curNumInputs);

    //     if (numInputs < curNumInputs) {
    //         curStates  
    //     }


    //     // state, signals[0] -> [signals[0], ...state]



    //     // Input 0: [On, Off, On, Off, ...]
    //     // Input 1: [Off, Off, On, On, ...]
    //     // Input 2: [Off, Off, Off]
    //     // [state: On, Off, On, Off]
    //     //
    //     // state has to be flat, so just make it:
    //     // [...Input 0, ...Input 1]
    //     // 
    //     // But next time around, how do we
    //     // 
    //     return {
    //         outputs: {},
    //         nextState: state,
    //     };
    // }, []),

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
    "Demultiplexer": MakeLocalPropagator((_obj, signals, _state) => {
        // TODO: Handle metastable
        const selects = signals["selects"].map(Signal.toBool);
        return { outputs: {
            "outputs": new Array<Signal>(Math.pow(2, selects.length))
                // All ports should be off except the selected one should === the input signal
                .fill(Signal.Off)
                .with(BCDtoDecimal(selects), signals["inputs"][0]),
        } };
    }),
    "Encoder": MakeLocalPropagator((_obj, signals, _state) => {
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
    }),
    "Decoder": MakeLocalPropagator((_obj, signals, _state) => {
        // TODO: Handle metastable
        const inputs = signals["inputs"].map(Signal.toBool);
        return { outputs: {
            "outputs": new Array<Signal>(Math.pow(2, inputs.length))
                // All ports should be off except the selected one should be On
                .fill(Signal.Off)
                .with(BCDtoDecimal(inputs), Signal.Off),
        } };
    }),
    "Comparator": MakeLocalPropagator((_obj, signals, _state) => {
        // TODO: Handle metastable
        const a = BCDtoDecimal(signals["inputsA"].map(Signal.toBool));
        const b = BCDtoDecimal(signals["inputsB"].map(Signal.toBool));
        return { outputs: {
            "lt": [a < b   ? Signal.On : Signal.Off],
            "eq": [a === b ? Signal.On : Signal.Off],
            "gt": [a > b   ? Signal.On : Signal.Off],
        } };
    }),
    "Label": MakeNoOutputPropagator(),
}
