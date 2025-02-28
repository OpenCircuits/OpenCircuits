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

    public setState(id: GUID, state: Signal[]): void {
        throw new Error("DigitalSim.setState: Unimplemented");
    }

    public step(): void {
        throw new Error("DigitalSim.step: Unimplemented");
    }

    public getSignal(id: GUID): Signal {
        return Signal.On;
    }

    public getState(id: GUID): Signal[] {
        throw new Error("DigitalSim.getState: Unimplemented");
    }
}
