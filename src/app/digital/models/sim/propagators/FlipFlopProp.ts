import {DigitalComponent} from "core/models/types/digital";

import {Signal} from "digital/models/sim/Signal";

import {Propagator} from "../Propagators";

// ToDo: implement an 'intial' state to have 'Q' port start as active
// ToDo2: possibly implement the use of clock and lastclock if needed
export const DFF: Propagator<DigitalComponent> = ({ signals, state }) => {
    const input = signals["inputs"];
    const sel = signals["selects"];

    // Set state variable
    state = (() => {
        // If PRE or CLR are set, then don't care about data or clock since asynchronous
        // Return same state as before
        if (sel[0] && sel[1]) {
            // undefined, just keep same state
            return state;
        // If PRE or CLR are set one at a time, set state to refelect
        } else if (sel[0]) {
            return [Signal.On, Signal.Off];
        } else if (sel[1]) {
            return [Signal.Off, Signal.On];
        }

        // If clock and input port is set, set the first ouput to on and the second to off
        if (input[0] && input[1]) {
            return [Signal.On, Signal.Off]
          // If just the second input port is set, activate the second port
        } else if (input[1] && !input[0]) {
            return [Signal.Off, Signal.On]
        }
        // If none of the above cases, return the same state as before
        return state;
    })();

    return [{ "outputs": state }, state]
}
// ToDo: Not working: need to set intial state and retest
export const TFF: Propagator<DigitalComponent> = ({ signals,state }) => {
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
        // If both ports are set, switch the state to the opposite of what it is
        if (input[0] && input[1]) {
            return [state[1], state[0]]
        }

        return state;
    })();

    return [{ "outputs": state }, state]
}
// TODO: implement the rest of the flipflop props
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