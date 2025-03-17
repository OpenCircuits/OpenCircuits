import {V} from "Vector";

import {Schema} from "shared/api/circuit/schema";

import {Signal} from "digital/api/circuit/internal/sim/Signal";
import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {DigitalComponentConfigurationInfo} from "../../DigitalComponents";
import {ComponentAssembler} from "shared/api/circuit/internal/assembly/ComponentAssembler";
import {Transform} from "math/Transform";
import {PolygonPrim} from "shared/api/circuit/internal/assembly/Prim";
import {Style} from "shared/api/circuit/internal/assembly/Style";


const horizontal = [V(-0.27,0.08), V(0.27,0.08), V(0.35,0), V(0.27,-0.08), V(-0.27,-0.08), V(-0.35,0)] as const;
const vertical = horizontal.map((v) => v.negativeReciprocal());
const horizontalHalf = [V(-0.095,0.08), V(0.095,0.08), V(0.175,0), V(0.095,-0.08), V(-0.095,-0.08), V(-0.175,0)] as const;
// bl - -47.5,40 47.5,40 87.5,0 47.5,-40 -47.5,-40 -87.5,0
// br - 47.5,90 -22.5,-135 -77.5,-135 7.5,135 47.5,135
// tl - -47.5,-90 22.5,135 77.5,135 -7.5,-135 -47.5,-135
// tr - 47.5,-90 -22.5,135 -77.5,135 7.5,-135 47.5,-135

export class SegmentDisplayAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;

    protected info: DigitalComponentConfigurationInfo;

    public constructor(params: AssemblerParams, sim: DigitalSim) {
        super(params, V(1.4, 2), {
            "inputs": (index, total) => {
                const y = this.size.y * index / (total + 2);
                return {
                    origin: V(-(this.size.x/2 - this.options.defaultBorderWidth), y),
                    target: V(-(this.options.defaultPortLength + this.size.x/2), y),
                }
            },
        }, [
            {
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged]),
                assemble:     (comp) => this.assembleRectangle(comp),

                styleChangesWhenSelected: true,

                getStyle: (comp) => this.options.fillStyle(this.isSelected(comp.id)),
            },
            // Render off segments then on segments
            {
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged]),
                assemble: (comp) => this.assembleSegments(comp),

                styleChangesWhenSelected: true,
                getStyle: (comp) => this.getSegmentStyle(comp),
            },
        ]);
        this.sim = sim;
        this.info = this.circuit.getComponentInfo("SegmentDisplay").unwrap() as DigitalComponentConfigurationInfo;
    }

    private assembleRectangle(comp: Schema.Component) {
        // Border is subtracted from size so that size matches constant high/low
        const transform = new Transform(this.getPos(comp), this.size.sub(V(this.options.defaultBorderWidth)), this.getAngle(comp));
        return {
            kind: "Rectangle",
            transform,
        } as const
    }

    private getSegmentStyle(comp: Schema.Component): Style {
        // If on, #1E5679 regardless of 
        const color = this.isSelected(comp.id) ? "#0E801F" : "#808080";
        return {
            stroke: { color, size: 0.01, lineCap: "round", lineJoin: "round" },
        }
    }

    private assembleSegments(comp: Schema.Component) {
        // Border is subtracted from size so that size matches constant high/low
        // const transform = new Transform(this.getPos(comp), this.size.sub(V(this.options.defaultBorderWidth)), this.getAngle(comp));
        const prims: Array<Omit<PolygonPrim, "style">> = [{
            kind:   "Polygon",
            points: [...horizontal],
        },
        {
            kind:   "Polygon",
            points: [...vertical],
        }];
        // const segmentCount = this.circuit.getCompByID(comp.id).unwrap().props["segmentCount"] ?? 7;
        // if (segmentCount === 7) {
        //     const prim: Omit<PolygonPrim, "style"> = {
        //         kind:   "Polygon",
        //         points: [...horizontal],
        //     }
        //     return {
        //         kind:  "Group",
        //         prims: [prim],
        //     } as const
        // }
        return {
            kind: "Group",
            prims,
        } as const
    }

    // TODO: Where should this value or function live?
    private getOutValue(comp: Schema.Component) {
        const [...outputs] = this.circuit.getPortsForComponent(comp.id).unwrap();
        return outputs.reduce((accumulator, portId, index) => accumulator + (Signal.isOn(this.sim.getSignal(portId)) ? 2 ** index : 0), 0);
    }
}
