import {V} from "../../../utils/math/Vector";
import {FlipFlop} from "./FlipFlop";

export class TFlipFlop extends FlipFlop {

    public constructor() {
        super(2, V(80, 80));
        this.getInputPort(0).setName(">");
        this.getInputPort(1).setName("T");
    }

    // @Override
    public activate(): void {
        this.lastClock = this.clock;
        this.clock   = this.inputs.get(0).getIsOn();
        const toggle = this.inputs.get(1).getIsOn();
        if (this.clock && !this.lastClock && toggle)
            this.state = !this.state;

        super.activate(this.state, 0);
        super.activate(!this.state, 1);
    }

    public getDisplayName(): string {
        return "T Flip Flop";
    }

    public getXMLName(): string {
        return "tff";
    }
}
