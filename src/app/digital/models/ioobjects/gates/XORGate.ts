import {serializable} from "serialeazy";

import {Vector,V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {QuadraticCurvePositioner} from "digital/models/ports/positioners/QuadraticCurvePositioner";

import {Gate} from "./Gate";
import {GetQuadraticOffset} from "./ORGate";


/**
 * Xor Gate implementation class. Also know as the inequality detector, returns true when only one of the inputs is a 1.
 */
@serializable("XORGate")
export class XORGate extends Gate {
    /**
     * Construtor for the XORgate with a min of 2 inputs and max of 8 inputs and loads svg file with (60,50) size
     *
     * @param not true for XNOR gate, false for XOR gate
     */
    public constructor(not: boolean = false) {
        super(not, new ClampedValue(2,2,8), V(60, 50), new QuadraticCurvePositioner());
    }
    /**
     * Activates the XOR gate only when one of the inputs is true but not when both inputs are true.
     */
    public activate(): void {
        let on = false;
        for (const input of this.getInputPorts())
            on = (on !== input.getIsOn());
        super.activate(on);
    }

    /**
     * Returns a vector which helps position the component's inputs when more inputs are added.
     *
     * @returns a vector representing the clickable offset
     */
    public getOffset(): Vector {
        return super.getOffset().add(0, GetQuadraticOffset(this.numInputs()));
    }
    /**
     * Returns the name of the gate
     *
     * @returns the display name of the gate
     */
    public getDisplayName(): string {
        return this.not ? "XNOR Gate" : "XOR Gate";
    }
    /**
     * Returns the name of the image used to display in the frontend.
     *
     * @return the name of the image to use to represent this gate
     */
    public getImageName(): string {
        return "or.svg";
    }
}

@serializable("XNORGate")
export class XNORGate extends XORGate {
    /**
    * Calls the constructor of XORGate with the parameter as false, indicating this is a XNOR gate
    */
    public constructor() {
        super(true);
    }
}
