import {DigitalComponent} from "core/models/types/digital";

import {Signal} from "digital/models/sim/Signal";

import {Propagator} from "../Propagators";

function up(clock: Signal, lastClock: Signal) {
    return (clock && !lastClock) as boolean;
}

// ToDo: implement an 'intial' state to have 'Q' port start as active
// ToDo2: possibly implement the use of clock and lastclock if needed
export const DFF: Propagator<DigitalComponent> = ({ signals, state = [Signal.Off, Signal.Off] }) => {
    const input = signals["inputs"];
    const sel = signals["selects"];

    const lastClock = state[1];
    const clock = input[1];

    //Let state have two variables
    //First one is Q, (can get 'Q as opposite of Q)
    //Second one keeps track of the last clock cycle
    //Only updates when the clock updates too
    //(last clock and current clock are different)

    state = (() => {
        // If PRE or CLR are set, then don't care about data or clock since asynchronous
        // Return same state as before
        if (sel[0] && sel[1]) {
            // undefined, just keep same state
            return state;
        // If PRE or CLR are set one at a time, set state to refelect
        } else if (sel[0]) {
            return [Signal.On, clock];
        } else if (sel[1]) {
            return [Signal.Off, clock];
        }

        if(clock && !lastClock)
            return [input[0], clock];
        return state;
    })();

    if(Signal.isOn(state[0])) {
        return [{ "outputs": [Signal.On, Signal.Off] }, state]
    }
    return [{ "outputs": [Signal.Off, Signal.On] }, state]
}
// ToDo: Not working: need to set intial state and retest
export const TFF: Propagator<DigitalComponent> = ({ signals,state }) => {
    console.log(signals) // keep here for now
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
            return [Signal.On, clock];
        } else if (sel[1]) {
            return [Signal.Off, clock];
        }

        if(up(clock, lastClock)) 
        {
            const set   = input[0];
            const reset = input[2];

            if (set && reset) {
                return [state[0], clock];
            } else if (set) {
                return [Signal.On, clock];
            } else if (reset) {
                return [Signal.Off, clock];
            }
        }
        return state;
    })();

    return [{ "outputs": state }, state]
}
export const SRFF: Propagator<DigitalComponent> = ({ signals,state }) => {
    console.log(signals) // keep here for now
    const input = signals["inputs"];
    const sel = signals["selects"];
    // split input into specific gates
    // run boolean logic

    return [signals]
}