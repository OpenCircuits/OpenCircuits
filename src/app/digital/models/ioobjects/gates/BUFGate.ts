import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";
import {serializable} from "serialeazy";

import {Gate} from "./Gate";

/**
 *Super class for gates that take one input and have one output,
 *Buffer Gates and Not Gates.
 *
 */
@serializable("BUFGate")
export class BUFGate extends Gate {
    /**
     *Creates a Buffer Gate.
     *@param [not] determines whether the gate is a Buffer gate or a Not gate
     */
    public constructor(not: boolean = false) {
        super(not, new ClampedValue(1,1,1), V(50, 50));
    }
    /**
     * Activate function, passes the input port state to 
     * the parent class activate function.
     */
    // @Override
    public activate(): void {
        super.activate(this.inputs.first.getIsOn());
    }
    
    /**
     * Returns a string the name of the gate
     * @return display name
     */
    public getDisplayName(): string {
        return this.not ? "NOT Gate" : "Buffer Gate";
    }

    /**
     * Returns the file name for the image used to represent the BUFGate
     * @return filename
     */
    public getImageName(): string {
        return "buf.svg";
    }
}
/**
 * Not Gate
 *
 * A gate that outputs the inverse of the signal that it is given.
 *
 */
@serializable("NOTGate")
export class NOTGate extends BUFGate {
    /**
     * Initializes a NOT gate
     */
    public constructor() {
        super(true);
    }
}
