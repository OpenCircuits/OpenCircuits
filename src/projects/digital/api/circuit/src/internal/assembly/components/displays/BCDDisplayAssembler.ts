import {AssemblerParams} from "shared/api/circuit/internal/assembly/Assembler";
import {DigitalSim}           from "digital/api/circuit/internal/sim/DigitalSim";
import {BaseDisplayAssembler} from "./BaseDisplayAssembler";
import {V} from "Vector";
import {Schema} from "shared/api/circuit/schema";
import {BCDFont, Segments, segmentToVector} from "./SegmentDisplayConstants";
import {PolygonPrim} from "shared/api/circuit/internal/assembly/Prim";


export class BCDDisplayAssembler extends BaseDisplayAssembler {
    public constructor(params: AssemblerParams, sim: DigitalSim) {
        super(params, sim, {
            kind:        "BCDDisplay",
            portFactory: {
                "inputs": (index, total) => {
                    const midpoint = (total - 1) / 2;
                    const y = -(.6 * this.size.y /2 * (index - midpoint) + (index === 0 ? 0.02 : index === total - 1 ? -0.02 : 0))
                    return {
                        // Subtracing the this.options.defaultBorderWidth prevent tiny gap between port stem and component
                        origin: V(-((this.size.x - this.options.defaultBorderWidth)/2), y),
                        target: V(-(this.options.defaultPortLength + this.size.x/2), y),
                    }
                },
            },
            assembleSegments: (comp: Schema.Component, segmentsOn: boolean) => {
                const compPos = this.getPos(comp);
                const inputValues = this.getInputValues(comp);

                const segmentCount = this.circuit.getCompByID(comp.id).unwrap().props["segmentCount"] as number | undefined ?? 7;
                const segments = Segments[segmentCount];
                const dec = inputValues.reduce((accumulator, isOn, index) => accumulator + (isOn ? 2 ** index : 0), 0);
                const font = BCDFont[segmentCount.toString()];
                const glyph = font[dec];
                const prims = segments.map((segment, index) => {
                    if (glyph.includes(index) === segmentsOn) {
                        const prim: Omit<PolygonPrim, "style"> = {
                            kind: "Polygon",

                            points: segmentToVector[segment[1]].map((vector) => vector.add(segment[0].scale(0.7)).add(compPos)),
                        }
                        return prim;
                    }
                }).filter((prim) => prim !== undefined);
                return {
                    kind: "Group",
                    prims,
                } as const
            },
        });
    }
}
