import {serializable} from "serialeazy";

import {FlipFlop} from "./FlipFlop";


@serializable("DFlipFlop")
export class DFlipFlop extends FlipFlop {
    public static readonly DATA_PORT = 2;

    public constructor() {
        super(1, 2);

        this.getInputPort(DFlipFlop.DATA_PORT).setName("D");
    }

    // @Override
    protected getNextState(): boolean {
        const data = this.inputs.get(DFlipFlop.DATA_PORT).getIsOn();

        if (this.up())
            return data;

        return this.getProp("state") as boolean;
    }

    public getDisplayName(): string {
        return "D Flip Flop";
    }
}
