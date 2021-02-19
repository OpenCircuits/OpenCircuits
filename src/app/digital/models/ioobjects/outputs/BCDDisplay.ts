import {serializable} from "serialeazy";

import {BCDFont} from "./BCDFont";

import {ClampedValue} from "math/ClampedValue";
import {PortsToDecimal} from "digital/utils/ComponentUtils";
import {SegmentDisplay} from "./SegmentDisplay";

// Index for BCDFont can be found at https://en.wikipedia.org/wiki/ASCII

@serializable("BCDDisplay")
export class BCDDisplay extends SegmentDisplay {
    public constructor() {
        // Always 7 inputs since number of segments is independent of number of inputs
        super(new ClampedValue(7));
    }

    public setInputPortCount(val: number): void {
        // don't change input port count since we
        //  have a constant number of inputs
        //  but change number of segments instead
        this.setSegmentCount(val);
    }

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

    public getDisplayName(): string {
        return `${this.segmentCount} BCD Display`;
    }
}
