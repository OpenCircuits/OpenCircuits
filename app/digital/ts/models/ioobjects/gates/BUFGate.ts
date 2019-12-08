import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";
import {serializable} from "serialeazy";

import {Gate} from "./Gate";

@serializable("BUFGate")
export class BUFGate extends Gate {

    public constructor(not: boolean = false) {
        super(not, new ClampedValue(1,1,1), V(50, 50));
    }

    // @Override
    public activate(): void {
        super.activate(this.inputs.first.getIsOn());
    }

    public getDisplayName(): string {
        return this.not ? "NOT Gate" : "Buffer Gate";
    }

    public getImageName(): string {
        return "buf.svg";
    }
}

@serializable("NOTGate")
export class NOTGate extends BUFGate {
    public constructor() {
        super(true);
    }
}
