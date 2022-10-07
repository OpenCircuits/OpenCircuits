import {serializable} from "serialeazy";

import {FlipFlop} from "./FlipFlop";


@serializable("TFlipFlop")
export class TFlipFlop extends FlipFlop {
    public static readonly TGL_PORT = 2;

    public constructor() {
        super(1, 2);

        this.getInputPort(TFlipFlop.TGL_PORT).setName("T");
    }

    // @Override
    protected getNextState(): boolean {
        const toggle = this.inputs.get(TFlipFlop.TGL_PORT).getIsOn();

        if (this.up() && toggle)
            return !this.getProp("state");

        return this.getProp("state") as boolean;
    }

    public getDisplayName(): string {
        return "T Flip Flop";
    }
}
