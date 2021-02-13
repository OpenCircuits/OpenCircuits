import {serializable} from "serialeazy";

import {Vector,V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {QuadraticCurvePositioner} from "digital/models/ports/positioners/QuadraticCurvePositioner";

import {Gate} from "./Gate";
import {GetQuadraticOffset} from "./ORGate";


@serializable("XORGate")
export class XORGate extends Gate {

    public constructor(not: boolean = false) {
        super(not, new ClampedValue(2,2,8), V(60, 50), new QuadraticCurvePositioner());
    }

    // @Override
    public activate(): void {
        let on = false;
        for (const input of this.getInputPorts())
            on = (on !== input.getIsOn());
        super.activate(on);
    }

    // @Override
    public getOffset(): Vector {
        return super.getOffset().add(0, GetQuadraticOffset(this.numInputs()));
    }

    public getDisplayName(): string {
        return this.not ? "XNOR Gate" : "XOR Gate";
    }

    public getImageName(): string {
        return "or.svg";
    }
}

@serializable("XNORGate")
export class XNORGate extends XORGate {
    public constructor() {
        super(true);
    }
}
