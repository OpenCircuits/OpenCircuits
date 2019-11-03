import {DEFAULT_BORDER_WIDTH,
        GATE_OR_CULLBOX_OFFSET} from "core/utils/Constants";
import {Vector, V} from "Vector";
import {ClampedValue} from "math/ClampedValue";
import {Gate} from "./Gate";

import {QuadraticCurvePositioner} from "../../ports/positioners/QuadraticCurvePositioner";

export function getQuadraticOffset(numInputs: number): number {

    //The wire extensions stay the same for inputs 4-6 so the offset is constant
    //We don't have to worry about 7 since the port positioning gives a proper cullbox
    if (numInputs > 3 && numInputs < 7)
        return  DEFAULT_BORDER_WIDTH + GATE_OR_CULLBOX_OFFSET;
    
    //At 8 inputs the wire extensions get bigger so we increase the offset
    else if (numInputs == 8)
        return  DEFAULT_BORDER_WIDTH + GATE_OR_CULLBOX_OFFSET*2;

    return 0;
}

export class ORGate extends Gate {

    public constructor(not: boolean = false) {
        super(not, new ClampedValue(2,2,8), V(60, 50), new QuadraticCurvePositioner());
    }

    // @Override
    public activate(): void {
        const on = this.getInputPorts().some((input) => input.getIsOn());
        super.activate(on);
    }

    public getDisplayName(): string {
        return this.not ? "NOR Gate" : "OR Gate";
    }

    public getImageName(): string {
        return "or.svg";
    }

    public getMinPos(): Vector {
        const min = super.getMinPos();


        const BOX_WIDTH = getQuadraticOffset(this.numInputs());
            
        // Find minimum pos from corners of transform
        const corners = this.transform.getCorners().map(
            v => v.sub(DEFAULT_BORDER_WIDTH,BOX_WIDTH)
        );

        return Vector.min(min, ...corners);
    }

    public getMaxPos(): Vector {
        const max = super.getMaxPos();

        const BOX_WIDTH = getQuadraticOffset(this.numInputs());

        // Find maximum pos from corners of transform
        const corners = this.transform.getCorners().map(
            v => v.add(DEFAULT_BORDER_WIDTH,BOX_WIDTH)
        );

        return Vector.max(max, ...corners);
    }

    public getXMLName(): string {
        return "or";
    }
}
