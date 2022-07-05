import {serializable} from "serialeazy";

import {Latch} from "./Latch";


@serializable("DLatch")
export class DLatch extends Latch {
    public static readonly DATA_PORT = 0;

    public constructor() {
        super(1);

        this.getInputPort(DLatch.DATA_PORT).setName("D");
    }

    protected getNextState(): boolean {
        return this.inputs.get(DLatch.DATA_PORT).getIsOn();
    }

    public getDisplayName(): string {
        return "D Latch";
    }
}
