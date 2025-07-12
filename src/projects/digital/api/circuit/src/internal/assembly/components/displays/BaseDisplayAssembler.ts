import {V, Vector} from "Vector";

import {ComponentAssembler, ComponentExtraAssemblerParams} from "shared/api/circuit/internal/assembly/ComponentAssembler";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";

import {DigitalSim}           from "digital/api/circuit/internal/sim/DigitalSim";
import {Signal} from "digital/api/circuit/schema/Signal";
import {Schema} from "shared/api/circuit/schema";
import {Style} from "shared/api/circuit/internal/assembly/Style";
import {SEGMENT_POINTS, SEGMENT_SIZE, SegmentType, Segments} from "./SegmentDisplayConstants";
import {PositioningHelpers} from "shared/api/circuit/internal/assembly/PortAssembler";


export interface BaseDisplayAssemblerParams extends ComponentExtraAssemblerParams {
    kind: string;
    spacing?: number;
    font?: Record<string, number[][]>;
}
export class BaseDisplayAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;
    protected font?: Record<string, number[][]>;

    public constructor(
        params: AssemblerParams,
        sim: DigitalSim,
        { kind, spacing, font, ...otherParams }: BaseDisplayAssemblerParams
    ) {
        super(params, {
                "inputs": (comp, index, total) => ({
                    origin: V(-0.5, -PositioningHelpers.ConstantSpacing(
                                        index, total, this.getSize(comp).y,
                                        { spacing: spacing ?? (this.options.defaultPortRadius*2 + 0.02) })),
                    dir: V(-1, 0),
                }),
            },
        [
            {
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged]),
                assemble:     (comp) => ({
                    kind:      "Rectangle",
                    transform: this.getTransform(comp),
                }),

                styleChangesWhenSelected: true,

                getStyle: (comp) => this.options.fillStyle(this.isSelected(comp.id)),
            },
            // Render off segments then on segments
            {
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.SignalsChanged, AssemblyReason.PortsChanged, AssemblyReason.PropChanged]),
                assemble:     (comp) => this.assembleSegments(comp, false),

                styleChangesWhenSelected: true,
                getStyle:                 (comp) => this.getSegmentStyle(comp, false),
            },
            {
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.SignalsChanged, AssemblyReason.PortsChanged, AssemblyReason.PropChanged]),
                assemble:     (comp) => this.assembleSegments(comp, true),

                styleChangesWhenSelected: true,
                getStyle:                 (comp) => this.getSegmentStyle(comp, true),
            },
        ], otherParams);

        this.sim = sim;
        this.font = font;
    }

    protected override getSize(_: Schema.Component): Vector {
        return V(1.4, 2);
    }

    protected getSegments(comp: Schema.Component, segmentsOn: boolean): Array<[Vector, SegmentType]> {
        if (!this.font)
            throw new Error("BaseDisplayAssembler: No font set!");

        // Get on glyphs for font
        const dec = this.getInputValues(comp)
            .reduce((accumulator, isOn, index) => accumulator + (isOn ? 2 ** index : 0), 0);

        const segmentCount = this.getSegmentCount(comp);
        const glyph = this.font[segmentCount.toString()][dec];

        return Segments[segmentCount].map((segment, index) => {
            if (glyph.includes(index) === segmentsOn)
                return segment;
        }).filter((prim) => prim !== undefined);
    }

    private assembleSegments(comp: Schema.Component, segmentsOn: boolean) {
        const segments = this.getSegments(comp, segmentsOn);
        const transform = this.getTransform(comp).withoutScale();
        return {
            kind:  "Group",
            prims: segments.map(([pos, segmentType]) => ({
                kind:   "Polygon",
                points: SEGMENT_POINTS[segmentType].map((vector) =>
                            transform.toWorldSpace(vector.add(pos.scale(SEGMENT_SIZE)))),
                ignoreHit: true,
            } as const)),
            ignoreHit: true,
        } as const
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

    protected getInputValues(comp: Schema.Component) {
        const [...inputPorts] = this.circuit.getPortsForComponent(comp.id).unwrap();
        return inputPorts.map((inputPort) => Signal.isOn(this.sim.getSignal(inputPort)));
    }

    protected getSegmentCount(comp: Schema.Component) {
        return this.circuit.getCompByID(comp.id).unwrap().props["segmentCount"] as number | undefined ?? 7;
    }
}
