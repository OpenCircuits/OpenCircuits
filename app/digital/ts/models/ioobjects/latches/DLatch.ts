import {Latch} from "./Latch";
import {serializable} from "serialeazy";

@serializable("DLatch")
export class DLatch extends Latch {
    public static readonly DATA_PORT = 0;

    public constructor() {
        super(1);

        this.getInputPort(DLatch.DATA_PORT).setName("D");
    }

    protected getNextState(): boolean {
        const data = this.inputs.get(DLatch.DATA_PORT).getIsOn();
        return data;
    }

    public getDisplayName(): string {
        return "D Latch";
    }
}
