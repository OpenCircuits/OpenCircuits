import {serializable} from "serialeazy";

import {FlipFlop} from "./FlipFlop";


@serializable("SRFlipFlop")
export class SRFlipFlop extends FlipFlop {
    public static readonly SET_PORT = 2;
    public static readonly RST_PORT = 4;

    public constructor() {
        super(2, 3);

        this.getInputPort(SRFlipFlop.SET_PORT).setName("S");
        this.getInputPort(SRFlipFlop.RST_PORT).setName("R");
    }

    // @Override
    protected getNextState(): boolean {
        const set   = this.inputs.get(SRFlipFlop.SET_PORT).getIsOn();
        const reset = this.inputs.get(SRFlipFlop.RST_PORT).getIsOn();

        if (this.up()) {
            if (set && reset) {
                // undefined
            } else if (set) {
                return true;
            } else if (reset) {
                return false;
            }
        }

        return this.getProp("state") as boolean;
    }

    public getDisplayName(): string {
        return "SR Flip Flop";
    }
}
