import {DEFAULT_BORDER_WIDTH,
        IO_PORT_RADIUS,
        IO_PORT_BORDER_WIDTH} from "../../../utils/Constants";
import {Vector, V} from "Vector";
import {ClampedValue} from "math/ClampedValue";
import {Gate} from "./Gate";

import {QuadraticCurvePositioner} from "../../ports/positioners/QuadraticCurvePositioner";

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

        // Find minimum pos from corners of transform
        var BOX_WIDTH = DEFAULT_BORDER_WIDTH;
        if(this.numInputs() >3 && this.numInputs() < 7)
            BOX_WIDTH += 50;
        if(this.numInputs() == 8)
            BOX_WIDTH += 100;

        const corners = this.transform.getCorners().map(
            v => v.sub(DEFAULT_BORDER_WIDTH,BOX_WIDTH)
        );

        return Vector.min(min, ...corners);
    }

    public getMaxPos(): Vector {
        const max = V(-Infinity);

        var BOX_WIDTH = DEFAULT_BORDER_WIDTH;
        if(this.numInputs() >3 && this.numInputs() < 7)
            BOX_WIDTH += 50;
        if(this.numInputs() == 8)
            BOX_WIDTH += 100;

        // Find maximum pos from corners of transform
        const corners = this.transform.getCorners().map(
            v => v.add(DEFAULT_BORDER_WIDTH,BOX_WIDTH)
        );

        // Find maximum pos from ports
        const ports = this.getPorts().map(
            p => p.getWorldTargetPos().add(IO_PORT_RADIUS+IO_PORT_BORDER_WIDTH)
        );

        return Vector.max(max, ...corners, ...ports);
    }

    public getXMLName(): string {
        return "or";
    }
}
