import {AssemblerParams} from "shared/api/circuit/internal/assembly/Assembler";
import {DigitalSim}           from "digital/api/circuit/internal/sim/DigitalSim";
import {BaseDisplayAssembler} from "./BaseDisplayAssembler";
import {Vector} from "Vector";
import {Schema} from "shared/api/circuit/schema";
import {ASCIIFont, SegmentType, Segments} from "./SegmentDisplayConstants";


export class ASCIIDisplayAssembler extends BaseDisplayAssembler {
    public constructor(params: AssemblerParams, sim: DigitalSim) {
        super(params, sim, {
            kind: "ASCIIDisplay",
        });
    }

    protected override getInputPortYValue(_comp: Schema.Component, index: number, total: number): number {
        const midpoint = (total - 1) / 2;
        return -((2*this.options.defaultPortRadius+.02) * (index - midpoint));
    }
    protected override getSegments(comp: Schema.Component, segmentsOn: boolean): Array<[Vector, SegmentType]> {
        const inputValues = this.getInputValues(comp);
        const segmentCount = this.getSegmentCount(comp);
        const segments = Segments[segmentCount];
        const dec = inputValues.reduce((accumulator, isOn, index) => accumulator + (isOn ? 2 ** index : 0), 0);
        const font = ASCIIFont[segmentCount.toString()];
        const glyph = font[dec];
        return segments.map((segment, index) => {
            if (glyph.includes(index) === segmentsOn) {
                return segment;
            }
        }).filter((prim) => prim !== undefined);
    }
}
