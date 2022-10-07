import {serializable} from "serialeazy";

import {Positioner} from "core/models/ports/positioners/Positioner";

import {InputPort} from "digital/models/ports/InputPort";

import {Latch} from "./Latch";


@serializable("SRLatch")
export class SRLatch extends Latch {
    public static readonly SET_PORT = 0;
    public static readonly RST_PORT = 2;

    public constructor() {
        super(2, new Positioner<InputPort>("left", 3/4));

        this.getInputPort(SRLatch.SET_PORT).setName("S");
        this.getInputPort(SRLatch.RST_PORT).setName("R");
    }

    protected getNextState(): boolean {
        const set   = this.inputs.get(SRLatch.SET_PORT).getIsOn();
        const reset = this.inputs.get(SRLatch.RST_PORT).getIsOn();

        if (set && reset) {
            // undefined behavior
        } else if (set) {
            return true;
        } else if (reset) {
            return false;
        }

        return this.getProp("state") as boolean;
    }

    public getDisplayName(): string {
        return "SR Latch";
    }
}
