import {Latch} from "./Latch";

import {ThreePortPositioner} from "../../ports/positioners/ThreePortPositioner";
import {serializable} from "serialeazy";

@serializable("SRLatch")
export class SRLatch extends Latch {

    public constructor() {
        super(3, new ThreePortPositioner());

        this.getInputPort(0).setName("R");
        this.getInputPort(1).setName(">");
        this.getInputPort(2).setName("S");
    }

    // @Override
    public activate(): void {
        this.clock  = this.inputs.get(1).getIsOn();
        const set   = this.inputs.get(2).getIsOn();
        const reset = this.inputs.get(0).getIsOn();
        if (this.clock) {
            if (set && reset) {
                // undefined behavior
            } else if (set) {
                this.state = true;
            } else if (reset) {
                this.state = false;
            }
        }

        super.activate(this.state, 1);
        super.activate(!this.state, 0);
    }

    public getDisplayName(): string {
        return "SR Latch";
    }
}
