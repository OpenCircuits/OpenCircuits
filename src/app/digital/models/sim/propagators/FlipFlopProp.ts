import {DigitalComponent} from "core/models/types/digital";

import {Signal} from "digital/models/sim/Signal";

import {Propagator} from "../Propagators";

// ToDo: actually get these implemented
export const DFF: Propagator<DigitalComponent> = ({ signals,state }) => {
    console.log(signals) // keep here for now
    const input = signals["inputs"];
    const sel = signals["selects"];

    const lastClock = state[1];
    const clock = input[1];

    state = (() => {
        // If PRE or CLR are set, then don't care about data or clock since asynchronous
        if (sel[0] && sel[1]) {
            // undefined, just keep same state
            return [state[0], clock];
        } else if (sel[0]) {
            return [1, clock];
        } else if (sel[1]) {
            return [0, clock];
        }
        if(clock && !lastClock)
            return [input[0], clock];
        return state;
    })();

    return [{ "outputs": state }, state]
}
export const TFF: Propagator<DigitalComponent> = ({ signals,state }) => {
    console.log(signals) // keep here for now
    const input = signals["inputs"];
    const sel = signals["selects"];
    // split input into specific gates
    // run boolean logic

    return [signals]
}
export const JKFF: Propagator<DigitalComponent> = ({ signals,state }) => {
    console.log(signals) // keep here for now
    const input = signals["inputs"];
    const sel = signals["selects"];
    // split input into specific gates
    // run boolean logic

    return [signals]
}
export const SRFF: Propagator<DigitalComponent> = ({ signals,state }) => {
    console.log(signals) // keep here for now
    const input = signals["inputs"];
    const sel = signals["selects"];
    // split input into specific gates
    // run boolean logic

    return [signals]
}