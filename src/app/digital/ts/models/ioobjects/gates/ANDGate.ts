import {serializable} from "serialeazy";

import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {Gate} from "./Gate";

@serializable("ANDGate")
export class ANDGate extends Gate {

    public constructor(not: boolean = false) {
        super(not, new ClampedValue(2,2,8), V(50, 50));
    }

    // @Override
    public activate(): void {
        const on = this.getInputPorts().every((input) => input.getIsOn());
        super.activate(on);
    }

    public getDisplayName(): string {
        return this.not ? "NAND Gate" : "AND Gate";
    }

    public getImageName(): string {
        return "and.svg";
    }
}

@serializable("NANDGate")
export class NANDGate extends ANDGate {
    public constructor() {
        super(true);
    }
}
