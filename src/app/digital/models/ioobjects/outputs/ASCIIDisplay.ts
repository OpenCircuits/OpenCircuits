import {serializable} from "serialeazy";


import {ClampedValue} from "math/ClampedValue";

import {PortsToDecimal} from "digital/utils/ComponentUtils";

import {ASCIIFont}      from "./ASCIIFont";
import {SegmentDisplay} from "./SegmentDisplay";

// Index for ASCIIFont can be found at https://en.wikipedia.org/wiki/ASCII

@serializable("ASCIIDisplay")
export class ASCIIDisplay extends SegmentDisplay {
    public constructor() {
        // Always 7 inputs since number of segments is independent of number of inputs
        super(new ClampedValue(7));
    }

    public override isSegmentOn(segment: number): boolean {
        const dec = PortsToDecimal(this.getInputPorts());

        const font = ASCIIFont[`${this.getSegmentCount()}`];
        if (!font)
            return false;

        const glyph = font[dec] as number[];
        if (!glyph)
            return false;

        return glyph.includes(segment);
    }

    public override getDisplayName(): string {
        return `${this.getSegmentCount()} ASCII Display`;
    }
}
