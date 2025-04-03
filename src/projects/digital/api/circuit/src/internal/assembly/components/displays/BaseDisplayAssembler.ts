import {V} from "Vector";

import {ComponentAssembler, ComponentPrimAssembly} from "shared/api/circuit/internal/assembly/ComponentAssembler";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {PortFactory} from "shared/api/circuit/internal/assembly/PortAssembler";

import {DigitalComponentConfigurationInfo} from "digital/api/circuit/internal/DigitalComponents";
import {DigitalSim}           from "digital/api/circuit/internal/sim/DigitalSim";
import {Signal} from "digital/api/circuit/internal/sim/Signal";
import {Transform} from "math/Transform";
import {PolygonPrim} from "shared/api/circuit/internal/assembly/Prim";
import {Schema} from "shared/api/circuit/schema";
import {Style} from "shared/api/circuit/internal/assembly/Style";


export interface BaseDisplayAssemblerParams {
    kind: string;
    portFactory: PortFactory;
    assembleSegments: (comp: Schema.Component, segmentsOn: boolean) => {
        readonly kind: "Group";
        readonly prims: Array<Omit<PolygonPrim, "style">>;
    };
    otherPrims?: ComponentPrimAssembly[];
}
export class BaseDisplayAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;
    protected info: DigitalComponentConfigurationInfo;

    public constructor(
        params: AssemblerParams,
        sim: DigitalSim,
        { kind, portFactory, assembleSegments, otherPrims }: BaseDisplayAssemblerParams
    ) {
        super(params, V(1.4, 2), portFactory, [
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

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.SignalsChanged, AssemblyReason.PortsChanged]),
                assemble:     (comp) => assembleSegments(comp, false),

                styleChangesWhenSelected: true,
                getStyle:                 (comp) => this.getSegmentStyle(comp, false),
            },
            {
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.SignalsChanged, AssemblyReason.PortsChanged]),
                assemble:     (comp) => assembleSegments(comp, true),

                styleChangesWhenSelected: true,
                getStyle:                 (comp) => this.getSegmentStyle(comp, true),
            },
            // Other prims
            ...(otherPrims ?? []),
        ]);

        this.sim = sim;
        this.info = this.circuit.getComponentInfo(kind).unwrap() as DigitalComponentConfigurationInfo;
    }

    private assembleRectangle(comp: Schema.Component) {
        // Border is subtracted from size so that size matches constant high/low
        const transform = new Transform(this.getPos(comp), this.size.sub(V(this.options.defaultBorderWidth)), this.getAngle(comp));
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
}
