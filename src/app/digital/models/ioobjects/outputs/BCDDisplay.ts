import {serializable} from "serialeazy";

import {BCDFont} from "./BCDFont";

import {ClampedValue} from "math/ClampedValue";
import {PortsToDecimal} from "digital/utils/ComponentUtils";
import {SegmentDisplay} from "./SegmentDisplay";
import {Positioner} from "core/models/ports/positioners/Positioner";
import {InputPort} from "digital/models/ports/InputPort";

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
     * Changes the number of segments used to display the input value.
     * Does not change the input port count.
     * @param val number of segments.
     */
    public setInputPortCount(val: number): void {
        // don't change input port count since we
        //  have a constant number of inputs
        //  but change number of segments instead
        this.setSegmentCount(val);
    }

    /**
     * Given a specific segment, returns true if that segment
     * should be on, accoring to the input ports.
     * @param segment the index of a segment.
     * @returns true if the segment is on, false otherwise.
     */
    public isSegmentOn(segment: number): boolean {
        const dec = PortsToDecimal(this.getInputPorts());

        const font = BCDFont[`${this.segmentCount}`];
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
     * @returns the display name.
     */
    public getDisplayName(): string {
        return `${this.segmentCount} BCD Display`;
    }
}
