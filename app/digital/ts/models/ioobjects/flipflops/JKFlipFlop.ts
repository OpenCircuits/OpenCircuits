import {V} from "../../../utils/math/Vector";

import {ThreePortPositioner} from "../../ports/positioners/ThreePortPositioner";

import {FlipFlop} from "./FlipFlop";

export class JKFlipFlop extends FlipFlop {

    public constructor() {
        super(3, V(80, 120), new ThreePortPositioner());

        this.getInputPort(0).setName("K");
        this.getInputPort(1).setName(">");
        this.getInputPort(2).setName("J");
    }

    // @Override
    public activate(): void {
        this.lastClock = this.clock;
        this.clock  = this.inputs.get(1).getIsOn();
        const set   = this.inputs.get(0).getIsOn();
        const reset = this.inputs.get(2).getIsOn();
        if (this.clock && !this.lastClock) {
            if (set && reset) {
                this.state = !this.state;
            } else if (set) {
                this.state = true;
            } else if (reset) {
                this.state = false;
            }
        }

        super.activate(this.state, 0);
        super.activate(!this.state, 1);
    }

    public getDisplayName(): string {
        return "JK Flip Flop";
    }

    public getXMLName(): string {
        return "jkff";
    }
}
