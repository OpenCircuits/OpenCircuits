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
import {ASCIIFont, BCDFont, Segments, segmentToVector} from "./SegmentDisplayConstants";


export class SegmentDisplayAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;

    protected info: DigitalComponentConfigurationInfo;

    protected readonly kind: "SegmentDisplay" | "BCDDisplay" | "ASCIIDisplay";

    public constructor(params: AssemblerParams, sim: DigitalSim, kind: "SegmentDisplay" | "BCDDisplay" | "ASCIIDisplay") {
        super(params, V(1.4, 2), {
            "inputs": (index, total) => {
                const midpoint = (total - 1) / 2;
                const y = (kind === "BCDDisplay")
                    ? -(.6 * this.size.y /2 * (index - midpoint) + (index === 0 ? 0.02 : index === total - 1 ? -0.02 : 0))
                    : -((2*this.options.defaultPortRadius+.02) * (index - midpoint))
                return {
                    // Subtracing the this.options.defaultBorderWidth prevent tiny gap between port stem and component
                    origin: V(-((this.size.x - this.options.defaultBorderWidth)/2), y),
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
            {
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.SelectionChanged, AssemblyReason.PortsChanged]),
                assemble:     (comp) => this.assembleLine(comp),

                getStyle: (comp) => this.getLineStyle(comp),
            },
            // Render off segments then on segments
            {
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.SignalsChanged, AssemblyReason.PortsChanged]),
                assemble:     (comp) => this.assembleSegments(comp, false),

                styleChangesWhenSelected: true,
                getStyle:                 (comp) => this.getSegmentStyle(comp, false),
            },
            {
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.SignalsChanged, AssemblyReason.PortsChanged]),
                assemble:     (comp) => this.assembleSegments(comp, true),

                styleChangesWhenSelected: true,
                getStyle:                 (comp) => this.getSegmentStyle(comp, true),
            },
        ]);
        this.sim = sim;
        this.info = this.circuit.getComponentInfo("SegmentDisplay").unwrap() as DigitalComponentConfigurationInfo;
        this.kind = kind;
    }

    private assembleRectangle(comp: Schema.Component) {
        // Border is subtracted from size so that size matches constant high/low
        const transform = new Transform(this.getPos(comp), this.size.sub(V(this.options.defaultBorderWidth)), this.getAngle(comp));
        return {
            kind: "Rectangle",
            transform,
        } as const
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

    private getSegmentStyle(comp: Schema.Component, segmentsOn: boolean): Style {
        // These values come from the result of using a tint when these segments were SVGs
        const color = segmentsOn ? "#1E5679" : this.isSelected(comp.id) ? "#0E801F" : "#808080";
        const fill = segmentsOn ? "#9ED6F9" : this.isSelected(comp.id) ? "#8EFF9F" : undefined;
        return {
            stroke: { color, size: 0.01, lineCap: "round", lineJoin: "round" },
            fill,
        }
    }

    private assembleSegments(comp: Schema.Component, segmentsOn: boolean) {
        // Border is subtracted from size so that size matches constant high/low
        // const transform = new Transform(this.getPos(comp), this.size.sub(V(this.options.defaultBorderWidth)), this.getAngle(comp));
        const compPos = this.getPos(comp);
        const inputValues = this.getInputValues(comp);
        if (this.kind === "SegmentDisplay") {
            const segments = Segments[inputValues.length];
            const prims = inputValues.map((inputIsOn, index) => {
                if (segmentsOn === inputIsOn) {
                    const segment = segments[index];
                    const prim: Omit<PolygonPrim, "style"> = {
                        kind:   "Polygon",
                        points: segmentToVector[segment[1]].map((vector) => vector.add(segment[0].scale(0.7)).add(compPos)),
                    }
                    return prim;
                }
            }).filter((prim) => prim !== undefined);
            return {
                kind: "Group",
                prims,
            } as const
        }

        // ASCII and BCD
        const segmentCount = this.circuit.getCompByID(comp.id).unwrap().props["segmentCount"] as number | undefined ?? 7;
        const segments = Segments[segmentCount];
        const dec = inputValues.reduce((accumulator, isOn, index) => accumulator + (isOn ? 2 ** index : 0), 0);
        const font = (this.kind === "BCDDisplay" ? BCDFont : ASCIIFont)[segmentCount.toString()];
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
    }

    // TODO: Where should this value or function live?
    private getInputValues(comp: Schema.Component) {
        const [...inputPorts] = this.circuit.getPortsForComponent(comp.id).unwrap();
        return inputPorts.map((inputPort) => Signal.isOn(this.sim.getSignal(inputPort)));
    }
}
