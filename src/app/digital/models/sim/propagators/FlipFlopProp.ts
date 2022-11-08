import {SignalMap} from "../Propagators"
import {Signal} from "digital/models/sim/Signal";

// ToDo: actually get these implemented
export const DFF: ({ signals }: { signals: SignalMap , state: Signal[] }) => [SignalMap] = ({ signals }) => {
    console.log(signals) // keep here for now
    const input = signals["inputs"];
    const sel = signals["select"];
    // split input into specific gates
    // run boolean logic

    return [signals]
}
export const TFF: ({ signals }: { signals: SignalMap , state: Signal[] }) => [SignalMap] = ({ signals }) => {
    console.log(signals) // keep here for now
    const input = signals["inputs"];
    const sel = signals["select"];
    // split input into specific gates
    // run boolean logic

    return [signals]
}
export const JKFF: ({ signals }: { signals: SignalMap , state: Signal[] }) => [SignalMap] = ({ signals }) => {
    console.log(signals) // keep here for now
    const input = signals["inputs"];
    const sel = signals["select"];
    // split input into specific gates
    // run boolean logic

    return [signals]
}
export const SRFF: ({ signals }: { signals: SignalMap , state: Signal[] }) => [SignalMap] = ({ signals }) => {
    console.log(signals) // keep here for now
    const input = signals["inputs"];
    const sel = signals["select"];
    // split input into specific gates
    // run boolean logic

    return [signals]
}