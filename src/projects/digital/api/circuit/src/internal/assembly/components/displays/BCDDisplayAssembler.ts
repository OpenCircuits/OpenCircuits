import {AssemblerParams} from "shared/api/circuit/internal/assembly/Assembler";
import {DigitalSim}           from "digital/api/circuit/internal/sim/DigitalSim";
import {BaseDisplayAssembler} from "./BaseDisplayAssembler";
import {Vector} from "Vector";
import {Schema} from "shared/api/circuit/schema";
import {BCDFont, SegmentType, Segments} from "./SegmentDisplayConstants";


export class BCDDisplayAssembler extends BaseDisplayAssembler {
    public constructor(params: AssemblerParams, sim: DigitalSim) {
        super(params, sim, {
            kind: "BCDDisplay",
        });
    }

    protected override getInputPortYValue(index: number, total: number): number {
        const midpoint = (total - 1) / 2;
        return -(.6 * this.size.y /2 * (index - midpoint) + (index === 0 ? 0.02 : index === total - 1 ? -0.02 : 0));
    }
    protected override getSegments(comp: Schema.Component, segmentsOn: boolean): Array<[Vector, SegmentType]> {
        const inputValues = this.getInputValues(comp);
        const segmentCount = this.getSegmentCount(comp);
        const segments = Segments[segmentCount];
        const dec = inputValues.reduce((accumulator, isOn, index) => accumulator + (isOn ? 2 ** index : 0), 0);
        const font = BCDFont[segmentCount.toString()];
        const glyph = font[dec];
        return segments.map((segment, index) => {
            if (glyph.includes(index) === segmentsOn) {
                return segment;
            }
        }).filter((prim) => prim !== undefined);
    }
}
