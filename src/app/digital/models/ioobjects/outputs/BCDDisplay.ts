import {serializable} from "serialeazy";


import {ClampedValue} from "math/ClampedValue";

import {Positioner} from "core/models/ports/positioners/Positioner";

import {PortsToDecimal} from "digital/utils/ComponentUtils";

import {InputPort} from "digital/models/ports/InputPort";

import {BCDFont}        from "./BCDFont";
import {SegmentDisplay} from "./SegmentDisplay";

/**
 * A representation of a BCD Display, which takes a Binary Coded Decimal
 * input from 4 input ports and uses a segmented display to represent
 * the value of the input in hexadecimal.
 */
@serializable("BCDDisplay")
export class BCDDisplay extends SegmentDisplay {

    /**
     * Initializes a BCD Display with 4 input ports.
     */
    public constructor() {
        // Always 4 inputs since number of segments is independent of number of inputs
        super(new ClampedValue(4), new Positioner<InputPort>("left", 0.6));
    }

    /**
     * Given a specific segment, returns true if that segment
     * should be on, accoring to the input ports.
     *
     * @param segment The index of a segment.
     * @returns         True if the segment is on, false otherwise.
     */
    public override isSegmentOn(segment: number): boolean {
        const dec = PortsToDecimal(this.getInputPorts());

        const font = BCDFont[`${this.getSegmentCount()}`];
        if (!font)
            return false;

        const glyph = font[dec] as number[];
        if (!glyph)
            return false;

        return glyph.includes(segment);
    }

    /**
     * Gets the display name of the BCD Display which includes
     * the number of segments it has.
     *
     * @returns The display name.
     */
    public override getDisplayName(): string {
        return `${this.getSegmentCount()} BCD Display`;
    }
}
