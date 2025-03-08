import {CircuitInternal, GUID} from "shared/api/circuit/internal";
import {Observable}            from "shared/api/circuit/utils/Observable";
import {Signal}                from "./Signal";


type DigitalSimEvent = {
    type: "step";
    queueEmpty: boolean;
} | {
    type: "queue";
    id: GUID;
}

export class DigitalSim extends Observable<DigitalSimEvent> {
    private readonly circuit: CircuitInternal;

    public constructor(circuit: CircuitInternal) {
        super();

        this.circuit = circuit;
    }

    /**
     * Sets the state of a component.
     *
     * @param id    Component's id.
     * @param state Component's state.
     */
    public setState(id: GUID, state: Signal[]): void {
        throw new Error("DigitalSim.setState: Unimplemented");
    }

    public step(): void {
        throw new Error("DigitalSim.step: Unimplemented");
    }

    /**
     * Gets the signal of a port.
     *
     * @param id Port's id.
     * @returns  Port's signal.
     */
    public getSignal(id: GUID): Signal {
        return Signal.On;
    }

    /**
     * Gets the state of a component.
     *
     * @param id Component's id.
     * @returns  Component's state.
     */
    public getState(id: GUID): Signal[] {
        throw new Error("DigitalSim.getState: Unimplemented");
    }
}
