import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {DigitalSim}           from "digital/api/circuit/internal/sim/DigitalSim";
import {BaseDisplayAssembler} from "./BaseDisplayAssembler";
import {V, Vector} from "Vector";
import {Schema} from "shared/api/circuit/schema";
import {SegmentType, Segments} from "./SegmentDisplayConstants";
import {Style} from "shared/api/circuit/internal/assembly/Style";


export class SegmentDisplayAssembler extends BaseDisplayAssembler {
    public constructor(params: AssemblerParams, sim: DigitalSim) {
        super(params, sim, {
            kind:       "SegmentDisplay",
            otherPrims: [{
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.SelectionChanged, AssemblyReason.PortsChanged]),
                assemble:     (comp) => this.assembleLine(comp),

                getStyle: (comp) => this.getLineStyle(comp),
            }],
        });
    }

    protected override getInputPortYValue(index: number, total: number): number {
        const midpoint = (total - 1) / 2;
        return -((2*this.options.defaultPortRadius+.02) * (index - midpoint));
    }
    protected override getSegments(comp: Schema.Component, segmentsOn: boolean): Array<[Vector, SegmentType]> {
        const inputValues = this.getInputValues(comp);
        const segments = Segments[inputValues.length];
        return inputValues.map((inputIsOn, index) => {
            if (segmentsOn === inputIsOn) {
                return segments[index];
            }
        }).filter((prim) => prim !== undefined);
    }

    private assembleLine(comp: Schema.Component) {
        const numInputs = [...this.circuit.getPortsForComponent(comp.id).unwrap()].length
        // const y = -((2*this.options.defaultPortRadius+.02) * (index - ((total - 1) / 2)));
        const y1 = -((2*this.options.defaultPortRadius+.02) * (-((numInputs - 1) / 2)));
        const y2 = -((2*this.options.defaultPortRadius+.02) * ((numInputs - 1) - ((numInputs - 1) / 2)));

        const x = -(this.size.x - this.options.defaultBorderWidth) / 2;

        const transform = this.getTransform(comp);
        return {
            kind: "Line",

            p1: transform.toWorldSpace(V(x, y1)),
            p2: transform.toWorldSpace(V(x, y2)),
        } as const;
    }

    private getLineStyle(comp: Schema.Component): Style {
        const style = this.options.lineStyle(this.isSelected(comp.id));
        const { stroke } = style
        return {
            ...style,
            stroke: stroke ? { ...stroke, lineCap: "square" } : undefined,
        }
    }
}
