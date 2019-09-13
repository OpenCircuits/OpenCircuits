import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {Component} from "../Component";

export class ConstantLow extends Component {

    public constructor(){
        super(new ClampedValue(0), new ClampedValue(1), V(50, 50));
        super.activate(false);
    }

    public getDisplayName(): string {
        return "Constant Low";
    }

    public getXMLName(): string {
        return "constlow";
    }

    public getImageName(): string {
        return "constLow.svg";
    }

}
