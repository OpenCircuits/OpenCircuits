import {serializable} from "serialeazy";

import {GATE_OR_CULLBOX_OFFSET} from "core/utils/Constants";

import {Vector, V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {QuadraticCurvePositioner} from "digital/models/ports/positioners/QuadraticCurvePositioner";

import {Gate} from "./Gate";


export function GetQuadraticOffset(numInputs: number): number {
    // The wire extensions stay the same for inputs 4-6 so the offset is constant
    // We don't have to worry about 7 since the port positioning gives a proper cullbox
    if (numInputs > 3 && numInputs < 7)
        return GATE_OR_CULLBOX_OFFSET;
    // At 8 inputs the wire extensions get bigger so we increase the offset
    if (numInputs === 8)
        return GATE_OR_CULLBOX_OFFSET*2;
    return 0;
}


@serializable("ORGate")
export class ORGate extends Gate {

    public constructor(not: boolean = false) {
        super(not, new ClampedValue(2,2,8), V(60, 50), new QuadraticCurvePositioner());
    }

    // @Override
    public activate(): void {
        const on = this.getInputPorts().some((input) => input.getIsOn());
        super.activate(on);
    }

    // @Override
    public getOffset(): Vector {
        return super.getOffset().add(0, GetQuadraticOffset(this.numInputs()));
    }

    public getDisplayName(): string {
        return this.not ? "NOR Gate" : "OR Gate";
    }

    public getImageName(): string {
        return "or.svg";
    }
}

@serializable("NORGate")
export class NORGate extends ORGate {
    public constructor() {
        super(true);
    }
}
