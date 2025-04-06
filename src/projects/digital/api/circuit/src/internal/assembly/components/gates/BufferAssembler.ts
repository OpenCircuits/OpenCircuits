import {DigitalComponentConfigurationInfo} from "digital/api/circuit/internal/DigitalComponents";
import {DigitalSim}           from "digital/api/circuit/internal/sim/DigitalSim";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {ComponentAssembler, ComponentBaseShapePrimAssembly} from "shared/api/circuit/internal/assembly/ComponentAssembler";
import {V} from "Vector";


export class BufferAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;
    protected info: DigitalComponentConfigurationInfo;

    public constructor(
        params: AssemblerParams, sim: DigitalSim, not: boolean
    ) {
        super(params, V(1, 1), {
            "outputs": () => ({ origin: V(0.4, 0), target: V(1.2, 0) }),
            "inputs":  (index, total) => {
                const spacing = 0.5 - this.options.defaultBorderWidth/2;
                return { origin: V(-0.5, spacing*((total-1)/2 - index)), dir: V(-1, 0) };
            },
        }, [
            // NOT symbol
            ...((not ? [{
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged]),
                assemble:     (gate) => ({
                    kind: "Circle",

                    pos:    this.getPos(gate).add(this.size.x / 2 + this.options.notPortCircleRadius, 0),
                    radius: this.options.notPortCircleRadius,
                }),

                styleChangesWhenSelected: true,
                getStyle:                 (gate) => ({
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

            { // SVG
                kind: "SVG",

                dependencies: new Set([AssemblyReason.TransformChanged]),
                assemble:     (gate) => ({
                    kind: "SVG",

                    svg:       "buf.svg",
                    transform: this.getTransform(gate),
                }),

                tintChangesWhenSelected: true,
                getTint:                 (comp) =>
                    (this.isSelected(comp.id) ? this.options.selectedFillColor : undefined),
            },
        ]);

        this.sim = sim;
        this.info = this.circuit.getComponentInfo(not ? "NOTGate" : "BUFGate").unwrap() as DigitalComponentConfigurationInfo;
    }
}
