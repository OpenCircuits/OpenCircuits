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

/**
 * Outputs true when at least one input is true.
 */
@serializable("ORGate")
export class ORGate extends Gate {
    /**
     * Creates an OR Gate with a default of 2 ports, a minimum of two ports, a maximum of 8 ports, and a size of 60 by 50 pixels.
     */
    public constructor(not: boolean = false) {
        super(not, new ClampedValue(2,2,8), V(60, 50), new QuadraticCurvePositioner());
    }
    /**
     * Checks if some of the inputs are on, and if they are, activates the gate.
     */
    // @Override
    public activate(): void {
        const on = this.getInputPorts().some((input) => input.getIsOn());
        super.activate(on);
    }

    /**
     * Calculates a height offset to account for more inputs than the default height can hold
     * @returns A vector with the symmetric offset based on the current input number
     */
    // @Override
    public getOffset(): Vector {
        return super.getOffset().add(0, GetQuadraticOffset(this.numInputs()));
    }
    /**
     * Returns the name of the gate, depending on if the instance is an or gate or a nor gate 
     * @returns 'NOR Gate' or 'OR Gate'
     */
    public getDisplayName(): string {
        return this.not ? "NOR Gate" : "OR Gate";
    }

    /**
     * Returns the name of the image displayed in the UI for the gate
     * @returns "or.svg"
     */
    public getImageName(): string {
        return "or.svg";
    }
}

/**
 * Outputs true when no inputs are true.
 */
@serializable("NORGate")
export class NORGate extends ORGate {
    public constructor() {
        super(true);
    }
}
