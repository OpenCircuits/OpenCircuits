import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {DigitalComponent} from "digital/models/DigitalComponent";
import {serializable} from "core/utils/Serializer";

@serializable("Label")
export class Label extends DigitalComponent {

    public constructor() {
        super(new ClampedValue(0), new ClampedValue(0), V(60, 30));
    }

    public getDisplayName(): string {
        return "LABEL";
    }

    public getXMLName(): string {
        return "label";
    }

}
