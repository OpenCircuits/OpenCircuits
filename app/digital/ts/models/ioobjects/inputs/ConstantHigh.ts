import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {DigitalComponent} from "digital/models/DigitalComponent";
import {serializable} from "core/utils/Serializer";

@serializable("ConstantHigh")
export class ConstantHigh extends DigitalComponent {

    public constructor() {
        super(new ClampedValue(0), new ClampedValue(1), V(50, 50));
        super.activate(true);
    }

    public getDisplayName(): string {
        return "Constant High";
    }

    public getXMLName(): string {
        return "consthigh";
    }

    public getImageName(): string {
        return "constHigh.svg";
    }

}
