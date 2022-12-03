import {DigitalComponent} from "core/models/types/digital";

import {Signal} from "digital/models/sim/Signal";

import {Propagator} from "digital/models/sim/propagators/typing";


function up(clock: Signal, lastClock: Signal) {
    return (clock && !lastClock) as boolean;
}

// ToDo: test but I think DFF is working
export const DFF: Propagator<DigitalComponent> = ({ signals, state = [Signal.Off, Signal.Off] }) => {
    const input = signals["inputs"];
    const sel = signals["selects"];

    // save last clock
    const lastClock = state[1];

    // update clock
    state[1] = input[1];

    // Let state have two variables
    // First one is Q, (can get 'Q as opposite of Q)
    // Second one keeps track of the last clock cycle

    // Only consider asynchronous ports if only one is active at a time
    if (Signal.isOn(sel[0]) && Signal.isOff(sel[1])) {
        state[0] = Signal.On;
    } else if (Signal.isOff(sel[0]) && Signal.isOn(sel[1])) {
        state[0] = Signal.Off;
    } else if (Signal.isOff(sel[0]) && Signal.isOn(state[1]) && Signal.isOff(lastClock))// check if we will update if no asynch
        state[0] = input[0];

    if (Signal.isOn(state[0])) {
        return [{ "outputs": [Signal.On, Signal.Off] }, state];
    }
    return [{ "outputs": [Signal.Off, Signal.On] }, state];
}

// ToDo: Not working: need to set intial state and retest
/**
 *
 * @param signals.signals
 * @param signals
 * @param state
 * @param signals.state
 * @class
 */
export const TFF: Propagator<DigitalComponent> = ({ signals,state }) => {
    const input = signals["inputs"];
    const sel = signals["selects"];

    // save last clock
    const lastClock = state[1];
    const lastQ = state[2]
    console.log(state)

    // xor and reuse D code

    // update clock
    state[1] = input[1];

    // Let state have two variables
    // First one is Q, (can get 'Q as opposite of Q)
    // Second one keeps track of the last clock cycle

    // Only consider asynchronous ports if only one is active at a time
    if (Signal.isOn(sel[0]) && Signal.isOff(sel[1])) {
        state[0] = Signal.On;
    } else if (Signal.isOff(sel[0]) && Signal.isOn(sel[1])) {
        state[0] = Signal.Off;
    } else if (Signal.isOff(sel[0]) && // check if we will update if no asynch
               Signal.isOn(state[1]) && Signal.isOff(lastClock) && Signal.isOn(input[0]))
        state[0] = Signal.isOn(state[0]) ? Signal.Off : Signal.On;


    let out = { "outputs": [Signal.Off, Signal.On] }
    if (Signal.isOn(state[0] | lastQ)) { // todo: check
        out = { "outputs": [Signal.On, Signal.Off] };
    }
    state[2] = out.outputs[1]
    return [out, state];
}
// TODO: implement the rest of the flipflop props
export const JKFF: Propagator<DigitalComponent> = ({ signals,state }) => {
    const input = signals["inputs"];
    const sel = signals["selects"];

    // save last clock
    const lastClock = state[1];

    // update clock
    state[1] = input[1];

    // Let state have two variables
    // First one is Q, (can get 'Q as opposite of Q)
    // Second one keeps track of the last clock cycle

    // Only consider asynchronous ports if only one is active at a time
    if (Signal.isOn(sel[0]) && Signal.isOff(sel[1])) {
        state[0] = Signal.On;
    } else if (Signal.isOff(sel[0]) && Signal.isOn(sel[1])) {
        state[0] = Signal.Off;
    } else if (Signal.isOff(sel[0]) && // check if we will update if no asynch
        Signal.isOn(state[1]) && Signal.isOff(lastClock)) {
            if (Signal.isOn(input[0]) && Signal.isOn(input[2])) {
                state[0] = Signal.isOn(state[0]) ? Signal.Off : Signal.On;
            }
            else if (Signal.isOn(input[0]) && Signal.isOff(input[2]))
                state[0] = Signal.On;
            else if (Signal.isOff(input[0]) && Signal.isOn(input[2]))
                state[0] = Signal.Off;
        }

    if (Signal.isOn(state[0])) {
        return [{ "outputs": [Signal.On, Signal.Off] }, state];
    }
    return [{ "outputs": [Signal.Off, Signal.On] }, state];
}
export const SRFF: Propagator<DigitalComponent> = ({ signals,state }) => {
    const input = signals["inputs"];
    const sel = signals["selects"];

    // save last clock
    const lastClock = state[1];

    // update clock
    state[1] = input[1];

    // Let state have two variables
    // First one is Q, (can get 'Q as opposite of Q)
    // Second one keeps track of the last clock cycle

    // Only consider asynchronous ports if only one is active at a time
    if (Signal.isOn(sel[0]) && Signal.isOff(sel[1])) {
        state[0] = Signal.On;
    } else if (Signal.isOff(sel[0]) && Signal.isOn(sel[1])) {
        state[0] = Signal.Off;
    } else if (Signal.isOff(sel[0]) && // check if we will update if no asynch
        Signal.isOn(state[1]) && Signal.isOff(lastClock)) {
            if (Signal.isOn(input[0]) && Signal.isOff(input[2]))
                state[0] = Signal.On;
            else if (Signal.isOff(input[0]) && Signal.isOn(input[2]))
                state[0] = Signal.Off;
        }

    if (Signal.isOn(state[0])) {
        return [{ "outputs": [Signal.On, Signal.Off] }, state];
    }
    return [{ "outputs": [Signal.Off, Signal.On] }, state];
}