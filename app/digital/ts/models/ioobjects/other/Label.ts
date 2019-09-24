import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {Component} from "core/models/Component";

export class Label extends Component {

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
