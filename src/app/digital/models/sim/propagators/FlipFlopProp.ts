import {DigitalComponent} from "core/models/types/digital";

import {Signal} from "digital/models/sim/Signal";

import {Propagator} from "digital/models/sim/propagators/typing";


// toDo: Test all propagators

function up(clock: Signal, lastClock: Signal) {
    return (clock && !lastClock) as boolean;
}

export const DFF: Propagator<DigitalComponent> = ({ signals, state = [Signal.Off, Signal.Off] }) => {
    // Break up ports
    const input = signals["inputs"];
    const sel = signals["selects"];

    // Save last clock
    const lastClock = state[1];

    // Update clock part of state variable
    state[1] = input[1];

    // Check if no asynchronous ports are active
    if (Signal.isOff(sel[0]) && Signal.isOff(sel[1])) {
        // If none are active we then check if we update
        if (up(state[1],lastClock))
            state[0] = input[0];
    } else {
        // Asynchronous active so we have to act accordingly
        if (Signal.isOn(sel[0]) && Signal.isOff(sel[1]))
            state[0] = Signal.On;
        if (Signal.isOff(sel[0]) && Signal.isOn(sel[1]))
                state[0] = Signal.Off;
    }

    // Set outputs to be state[0] and it's opposite
    const tmp = Signal.isOn(state[0]) ? Signal.Off : Signal.On;
    return [{ "outputs": [state[0], tmp] }, state];
}

export const TFF: Propagator<DigitalComponent> = ({ signals, state = [Signal.Off, Signal.Off] }) => {
    const input = signals["inputs"];
    const sel = signals["selects"];

    const lastClock = state[1];
    state[1] = input[1];

    if (Signal.isOff(sel[0]) && Signal.isOff(sel[1])) {
        if (up(state[1],lastClock) && Signal.isOn(input[0])) {
            // If we update we will flip the current state
            state[0] = Signal.isOn(state[0]) ? Signal.Off : Signal.On;
        }
    } else {
        if (Signal.isOn(sel[0]) && Signal.isOff(sel[1]))
            state[0] = Signal.On;
        if (Signal.isOff(sel[0]) && Signal.isOn(sel[1]))
                state[0] = Signal.Off;
    }

    const tmp = Signal.isOn(state[0]) ? Signal.Off : Signal.On;
    return [{ "outputs": [state[0], tmp] }, state];
}

export const JKFF: Propagator<DigitalComponent> = ({ signals, state = [Signal.Off, Signal.Off] }) => {
    const input = signals["inputs"];
    const sel = signals["selects"];

    const lastClock = state[1];
    state[1] = input[1];

    if (Signal.isOff(sel[0]) && Signal.isOff(sel[1])) {
        if (up(state[1],lastClock)) {
            // If both inputs are active we flip the signal
            if (Signal.isOn(input[0]) && Signal.isOn(input[2])) {
                state[0] = Signal.isOn(state[0]) ? Signal.Off : Signal.On;
            }
            // If only one port is active we set it to that one
            else if (Signal.isOn(input[0]) && Signal.isOff(input[2]))
                state[0] = Signal.On;
            else if (Signal.isOff(input[0]) && Signal.isOn(input[2]))
                state[0] = Signal.Off;
        }
    } else {
        if (Signal.isOn(sel[0]) && Signal.isOff(sel[1]))
            state[0] = Signal.On;
        if (Signal.isOff(sel[0]) && Signal.isOn(sel[1]))
                state[0] = Signal.Off;
    }

    const tmp = Signal.isOn(state[0]) ? Signal.Off : Signal.On;
    return [{ "outputs": [state[0], tmp] }, state];
}

export const SRFF: Propagator<DigitalComponent> = ({ signals, state = [Signal.Off, Signal.Off] }) => {
    const input = signals["inputs"];
    const sel = signals["selects"];

    const lastClock = state[1];
    state[1] = input[1];

    if (Signal.isOff(sel[0]) && Signal.isOff(sel[1])) {
        if (up(state[1],lastClock)) {
            // If only one input is active we set it to that one
            if (Signal.isOn(input[0]) && Signal.isOff(input[2]))
                state[0] = Signal.On;
            else if (Signal.isOff(input[0]) && Signal.isOn(input[2]))
                state[0] = Signal.Off;
        }
    } else {
        if (Signal.isOn(sel[0]) && Signal.isOff(sel[1]))
            state[0] = Signal.On;
        if (Signal.isOff(sel[0]) && Signal.isOn(sel[1]))
                state[0] = Signal.Off;
    }

    const tmp = Signal.isOn(state[0]) ? Signal.Off : Signal.On;
    return [{ "outputs": [state[0], tmp] }, state];
}
