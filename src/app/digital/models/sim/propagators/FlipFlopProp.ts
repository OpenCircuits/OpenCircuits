import {DigitalComponent} from "core/models/types/digital";

import {Signal} from "digital/models/sim/Signal";

import {Propagator} from "../Propagators";

// ToDo: actually get these implemented
export const DFF: Propagator<DigitalComponent> = ({ signals, state }) => {
    // console.log(signals) // keep here for now
    const input = signals["inputs"];
    const sel = signals["selects"];

    state = (() => {
        // If PRE or CLR are set, then don't care about data or clock since asynchronous
        if (sel[0] && sel[1]) {
            // undefined, just keep same state
            return state;
        } else if (sel[0]) {
            return [Signal.On, Signal.Off];
        } else if (sel[1]) {
            return [Signal.Off, Signal.On];
        }

        if (input[0] && input[1]) {
            return [Signal.On, Signal.Off]
        } else if (input[1] && !input[0]) {
            return [Signal.Off, Signal.On]
        }

        return state;
    })();

    return [{ "outputs": state }, state]
}
export const TFF: Propagator<DigitalComponent> = ({ signals,state }) => {
    // console.log(signals) // keep here for now
    const input = signals["inputs"];
    const sel = signals["selects"];
    // split input into specific gates
    // run boolean logic

    return [signals]
}
export const JKFF: Propagator<DigitalComponent> = ({ signals,state }) => {
    // console.log(signals) // keep here for now
    const input = signals["inputs"];
    const sel = signals["selects"];
    // split input into specific gates
    // run boolean logic

    return [signals]
}
export const SRFF: Propagator<DigitalComponent> = ({ signals,state }) => {
    // console.log(signals) // keep here for now
    const input = signals["inputs"];
    const sel = signals["selects"];
    // split input into specific gates
    // run boolean logic

    return [signals]
}