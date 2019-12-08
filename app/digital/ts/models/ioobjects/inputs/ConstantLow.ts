import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {DigitalComponent} from "digital/models/DigitalComponent";
import {serializable} from "serialeazy";

@serializable("ConstantLow")
export class ConstantLow extends DigitalComponent {

    public constructor() {
        super(new ClampedValue(0), new ClampedValue(1), V(50, 50));
        super.activate(false);
    }

    public getDisplayName(): string {
        return "Constant Low";
    }

    public getImageName(): string {
        return "constLow.svg";
    }

}
