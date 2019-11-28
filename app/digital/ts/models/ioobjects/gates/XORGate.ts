import {DEFAULT_BORDER_WIDTH} from "core/utils/Constants";

import {Vector,V} from "Vector";
import {ClampedValue} from "math/ClampedValue";
import {serializable} from "core/utils/Serializer";

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

    public getDisplayName(): string {
        return this.not ? "XNOR Gate" : "XOR Gate";
    }

    public getImageName(): string {
        return "or.svg";
    }

    public getMinPos(): Vector {
        const min = super.getMinPos();

        // Find minimum pos from corners of transform
        const BOX_WIDTH = GetQuadraticOffset(this.numInputs());
        const corners = this.transform.getCorners().map(
            v => v.sub(DEFAULT_BORDER_WIDTH,BOX_WIDTH)
        );

        return Vector.min(min, ...corners);
    }

    public getMaxPos(): Vector {
        const max = super.getMaxPos();

        // Find maximum pos from corners of transform
        const BOX_WIDTH = GetQuadraticOffset(this.numInputs());
        const corners = this.transform.getCorners().map(
            v => v.add(DEFAULT_BORDER_WIDTH,BOX_WIDTH)
        );

        return Vector.max(max, ...corners);
    }

    public getXMLName(): string {
        return "xor";
    }
}
