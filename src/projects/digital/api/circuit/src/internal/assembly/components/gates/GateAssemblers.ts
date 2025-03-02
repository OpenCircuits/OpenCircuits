import {Vector}         from "Vector";

import {ComponentAssembler, ComponentBaseShapePrimAssembly} from "shared/api/circuit/internal/assembly/ComponentAssembler";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {PortFactory} from "shared/api/circuit/internal/assembly/PortAssembler";

import {DigitalComponentInfo} from "digital/api/circuit/internal/DigitalComponents";
import {DigitalSim}           from "digital/api/circuit/internal/sim/DigitalSim";


export type SimplifiedAssembly = {
    assemble: ComponentBaseShapePrimAssembly["assemble"];
    getStyle: ComponentBaseShapePrimAssembly["getStyle"];
}
export interface GateAssemblerParams {
    kind: string;
    size: Vector;
    svg: string;
    not: boolean;
    portFactory: PortFactory;
    otherPrims: SimplifiedAssembly[];
}
export class GateAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;
    protected info: DigitalComponentInfo;

    public constructor(
        params: AssemblerParams,
        sim: DigitalSim,
        { kind, size, svg, not, portFactory, otherPrims }: GateAssemblerParams
    ) {
        super(params, size, portFactory, [
            // NOT symbol
            ...((not ? [{
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged]),
                assemble: (gate) => ({
                    kind: "Circle",

                    pos:    this.getPos(gate).add(this.size.x / 2 + this.options.notPortCircleRadius, 0),
                    radius: this.options.notPortCircleRadius,
                }),

                styleChangesWhenSelected: true,
                getStyle: (gate) => ({
                    fill: (this.isSelected(gate.id)
                        ? this.options.selectedFillColor
                        : this.options.defaultFillColor),
                    stroke: {
                        color: (this.isSelected(gate.id)
                            ? this.options.selectedBorderColor
                            : this.options.defaultBorderColor),
                        size: this.options.defaultBorderWidth,
                    },
                }),
            } satisfies ComponentBaseShapePrimAssembly] : [])),

            // Other prims
            ...otherPrims.map((o) => ({
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.PortsChanged]),
                assemble: (gate) => o.assemble(gate),

                styleChangesWhenSelected: true,
                getStyle: (gate) => o.getStyle(gate),
            } satisfies ComponentBaseShapePrimAssembly)),

            { // SVG
                kind: "SVG",

                dependencies: new Set([AssemblyReason.TransformChanged]),
                assemble: (gate) => ({
                    kind: "SVG",

                    svg:       svg,
                    transform: this.getTransform(gate),
                }),

                tintChangesWhenSelected: true,
                getTint: (comp) =>
                    (this.isSelected(comp.id) ? this.options.selectedFillColor : undefined),
            },
        ]);

        this.sim = sim;
        this.info = this.circuit.getComponentInfo(kind).unwrap() as DigitalComponentInfo;
    }
}
