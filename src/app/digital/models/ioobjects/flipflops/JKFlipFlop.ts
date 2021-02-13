import {serializable} from "serialeazy";

import {V} from "Vector";

import {FlipFlopPositioner} from "digital/models/ports/positioners/FlipFlopPositioner";

import {FlipFlop} from "./FlipFlop";

@serializable("JKFlipFlop")
export class JKFlipFlop extends FlipFlop {
    public static readonly SET_PORT = 2;
    public static readonly RST_PORT = 4;

    public constructor() {
        super(2, V(100, 120), new FlipFlopPositioner(3));

        this.getInputPort(JKFlipFlop.SET_PORT).setName("J");
        this.getInputPort(JKFlipFlop.RST_PORT).setName("K");
    }

    // @Override
    protected getNextState(): boolean {
        const set   = this.inputs.get(JKFlipFlop.SET_PORT).getIsOn();
        const reset = this.inputs.get(JKFlipFlop.RST_PORT).getIsOn();

        if (this.up()) {
            if (set && reset) {
                return !this.state;
            } else if (set) {
                return true;
            } else if (reset) {
                return false;
            }
        }

        return this.state;
    }

    public getDisplayName(): string {
        return "JK Flip Flop";
    }
}
