import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {Component} from "../Component";

export class ConstantHigh extends Component {

    public constructor(){
        super(new ClampedValue(0), new ClampedValue(1), V(50, 50));
        super.activate(true);
    }

    public getDisplayName(): string {
        return "Constant High";
    }

    public getXMLName(): string {
        return "consthigh";
    }

    // @Override
    public copy(): Component {
        const c = super.copy();
        c.activate(true);
        return c;
    }

    public getImageName(): string {
        return "constHigh.svg";
    }

}
