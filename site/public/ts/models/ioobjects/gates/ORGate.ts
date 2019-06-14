import {V} from "../../../utils/math/Vector";
import {ClampedValue} from "../../../utils/ClampedValue";
import {Gate} from "./Gate";

import {QuadraticCurvePositioner} from "../../ports/positioners/QuadraticCurvePositioner";

export class ORGate extends Gate {

    public constructor(not: boolean = false) {
        super(not, new ClampedValue(2,2,8), V(60, 50), new QuadraticCurvePositioner());
    }

    // @Override
    public activate() {
        const on = this.getInputPorts().some((input) => input.getIsOn());
        super.activate(on);
    }

    public getDisplayName() {
        return this.not ? "NOR Gate" : "OR Gate";
    }

    public getImageName() {
        return "or.svg";
    }

    public getXMLName(): string {
        return "or";
    }
}
