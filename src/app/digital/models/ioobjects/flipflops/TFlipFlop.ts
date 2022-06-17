import {V} from "Vector";
import {FlipFlop} from "./FlipFlop";
import {serializable} from "serialeazy";
import {FlipFlopPositioner} from "digital/models/ports/positioners/FlipFlopPositioner";

@serializable("TFlipFlop")
export class TFlipFlop extends FlipFlop {
    public static readonly TGL_PORT = 2;

    public constructor() {
        super(1, V(100, 120), new FlipFlopPositioner(2));

        this.getInputPort(TFlipFlop.TGL_PORT).setName("T");
    }

    // @Override
    protected getNextState(): boolean {
        const toggle = this.inputs.get(TFlipFlop.TGL_PORT).getIsOn();

        if (this.up() && toggle)
            return !this.state;

        return this.state;
    }

    public getDisplayName(): string {
        return "T Flip Flop";
    }
}
