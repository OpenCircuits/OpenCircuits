import {serializable} from "serialeazy";

import {V} from "Vector";

import {ClampedValue} from "math/ClampedValue";

import {Gate} from "./Gate";

/**
 * The AND gate. This logic gate supports at least 2 inputs and its output is on
 * only when all inputs are on. It may also be created as a NAND gate in the
 * constructor, which will invert the output, that is, it outputs off only when
 * all inputs are on.
 */
@serializable("ANDGate")
export class ANDGate extends Gate {

    /**
     * Creates an AND (or NAND) gate.
     *
     * @param not True if this should be a NAND gate.
     */
    public constructor(not = false) {
        super(not, new ClampedValue(2,2,8), V(1, 1));
    }

    /**
     * Uses the inputs to determine the output signal from this logic gate, that
     * is, on only when all of the inputs are on.
     */
    public override activate(): void {
        const on = this.getInputPorts().every((input) => input.getIsOn());
        super.activate(on);
    }

    /**
     * Returns the display name for this logic gate, either "AND Gate" or
     * "NAND Gate".
     *
     * @returns The display name ("NAND Gate" or "AND Gate").
     */
    public getDisplayName(): string {
        return this.getProp("not") ? "NAND Gate" : "AND Gate";
    }

    /**
     * Returns the filename for the image used by this logic gate.
     *
     * @returns The image filename.
     */
    public override getImageName(): string {
        return "and.svg";
    }
}

/**
 * The NAND gate. This is functionally equivalent to the AND gate with `true`
 * passed to the constructor.
 */
@serializable("NANDGate")
export class NANDGate extends ANDGate {
    /**
     * Creates a NAND gate.
     */
    public constructor() {
        super(true);
    }
}
