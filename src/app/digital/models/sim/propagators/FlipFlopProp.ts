import {DigitalComponent} from "core/models/types/digital";
import {Propagator} from "../Propagators"

// ToDo: actually get these implemented
export const DFF: Propagator<DigitalComponent> = ({ signals,state }) => {
    console.log(signals) // keep here for now
    const input = signals["inputs"];
    const sel = signals["select"];
    // split input into specific gates
    // run boolean logic

    return [signals]
}
export const TFF: Propagator<DigitalComponent> = ({ signals,state }) => {
    console.log(signals) // keep here for now
    const input = signals["inputs"];
    const sel = signals["select"];
    // split input into specific gates
    // run boolean logic

    return [signals]
}
export const JKFF: Propagator<DigitalComponent> = ({ signals,state }) => {
    console.log(signals) // keep here for now
    const input = signals["inputs"];
    const sel = signals["select"];
    // split input into specific gates
    // run boolean logic

    return [signals]
}
export const SRFF: Propagator<DigitalComponent> = ({ signals,state }) => {
    console.log(signals) // keep here for now
    const input = signals["inputs"];
    const sel = signals["select"];
    // split input into specific gates
    // run boolean logic

    return [signals]
}