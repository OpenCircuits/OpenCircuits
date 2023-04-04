import {CircuitInternal, GUID} from "core/internal";
import {Observable}            from "core/utils/Observable";
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

    public setState(id: GUID, state: Signal[]): void {
        throw new Error("Unimplemented");
    }

    public step(): void {
        throw new Error("Unimplemented");
    }

    public getSignal(id: GUID): Signal {
        return Signal.On;
    }

    public getState(id: GUID): Signal[] {
        throw new Error("Unimplemented");
    }
}
