import {V, Vector} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {DigitalComponent} from "digital/models/DigitalComponent";
import {serializable} from "serialeazy";

@serializable("ConstantLow")
export class ConstantLow extends DigitalComponent {

    public constructor() {
        super(new ClampedValue(0), new ClampedValue(1), V(50, 50));
        super.activate(false);
    }

    // @Override
    public getOffset(): Vector {
        return V();
    }

    public getDisplayName(): string {
        return "Constant Low";
    }

    public getImageName(): string {
        return "constLow.svg";
    }

}
