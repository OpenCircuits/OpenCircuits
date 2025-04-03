import {AssemblerParams} from "shared/api/circuit/internal/assembly/Assembler";
import {DigitalSim}           from "digital/api/circuit/internal/sim/DigitalSim";
import {BaseDisplayAssembler} from "./BaseDisplayAssembler";
import {V} from "Vector";
import {Schema} from "shared/api/circuit/schema";
import {ASCIIFont, Segments, segmentToVector} from "./SegmentDisplayConstants";
import {PolygonPrim} from "shared/api/circuit/internal/assembly/Prim";


export class ASCIIDisplayAssembler extends BaseDisplayAssembler {
    public constructor(params: AssemblerParams, sim: DigitalSim) {
        super(params, sim, {
            kind:        "ASCIIDisplay",
            portFactory: {
                "inputs": (index, total) => {
                    const midpoint = (total - 1) / 2;
                    const y = -((2*this.options.defaultPortRadius+.02) * (index - midpoint));
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
                const font = ASCIIFont[segmentCount.toString()];
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
