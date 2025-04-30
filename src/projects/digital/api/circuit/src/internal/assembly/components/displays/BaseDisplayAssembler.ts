import {V, Vector} from "Vector";

import {ComponentAssembler, ComponentPrimAssembly} from "shared/api/circuit/internal/assembly/ComponentAssembler";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";

import {DigitalComponentConfigurationInfo} from "digital/api/circuit/internal/DigitalComponents";
import {DigitalSim}           from "digital/api/circuit/internal/sim/DigitalSim";
import {Signal} from "digital/api/circuit/schema/Signal";
import {Transform} from "math/Transform";
import {Schema} from "shared/api/circuit/schema";
import {Style} from "shared/api/circuit/internal/assembly/Style";
import {SegmentType, segmentToVector} from "./SegmentDisplayConstants";


export interface BaseDisplayAssemblerParams {
    kind: string;
    otherPrims?: ComponentPrimAssembly[];
}
export abstract class BaseDisplayAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;
    protected info: DigitalComponentConfigurationInfo;

    public constructor(
        params: AssemblerParams,
        sim: DigitalSim,
        { kind, otherPrims }: BaseDisplayAssemblerParams
    ) {
        super(params, {
                "inputs": (comp, index, total) => {
                    const y = this.getInputPortYValue(comp, index, total);
                    return {
                        // Subtracting the this.options.defaultBorderWidth
                        // prevents tiny gap between port stem and component
                        origin: V(-((this.getSize(comp).x - this.options.defaultBorderWidth)/2), y),
                        target: V(-(this.options.defaultPortLength + this.getSize(comp).x/2), y),
                    }
                },
            },
        [
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
            // Other prims
            ...(otherPrims ?? []),
        ]);

        this.sim = sim;
        this.info = this.circuit.getComponentInfo(kind).unwrap() as DigitalComponentConfigurationInfo;
    }

    protected override getSize(_: Schema.Component): Vector {
        return V(1.4, 2);
    }

    protected abstract getInputPortYValue(comp: Schema.Component, index: number, total: number): number;
    protected abstract getSegments(comp: Schema.Component, segmentsOn: boolean): Array<[Vector, SegmentType]>;

    private assembleSegments(comp: Schema.Component, segmentsOn: boolean) {
        const segments = this.getSegments(comp, segmentsOn);
        const transform = this.getTransform(comp);
        const prims = segments.map(([pos, segmentType]) => ({
            kind:   "Polygon",
            points: segmentToVector[segmentType].map((vector) => transform.toWorldSpace(vector.add(pos.scale(0.7)))),
        } as const));
        return {
            kind: "Group",
            prims,
        } as const
    }

    private assembleRectangle(comp: Schema.Component) {
        const transform = new Transform(
            this.getPos(comp),
            this.getSize(comp).sub(V(this.options.defaultBorderWidth)),
            this.getAngle(comp),
        );
        return {
            kind: "Rectangle",
            transform,
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
