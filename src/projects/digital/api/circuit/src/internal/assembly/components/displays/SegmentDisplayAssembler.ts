import {AssemblerParams} from "shared/api/circuit/internal/assembly/Assembler";
import {DigitalSim}           from "digital/api/circuit/internal/sim/DigitalSim";
import {BaseDisplayAssembler} from "./BaseDisplayAssembler";
import {Vector} from "Vector";
import {Schema} from "shared/api/circuit/schema";
import {SegmentType, Segments} from "./SegmentDisplayConstants";


export class SegmentDisplayAssembler extends BaseDisplayAssembler {
    public constructor(params: AssemblerParams, sim: DigitalSim) {
        super(params, sim, { drawPortLineForGroups: ["inputs"] });
    }

    protected override getSegments(comp: Schema.Component, segmentsOn: boolean): Array<[Vector, SegmentType]> {
        const inputValues = this.getInputValues(comp);
        const segments = Segments[inputValues.length];

        return inputValues.map((inputIsOn, index) => {
            if (segmentsOn === inputIsOn)
                return segments[index];
        }).filter((prim) => prim !== undefined);
    }
}
