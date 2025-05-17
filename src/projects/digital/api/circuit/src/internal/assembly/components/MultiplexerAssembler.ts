import {V, Vector} from "Vector";

import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {DigitalComponentConfigurationInfo} from "../../DigitalComponents";
import {ComponentAssembler} from "shared/api/circuit/internal/assembly/ComponentAssembler";
import {Schema} from "shared/api/circuit/schema";
import {PositioningHelpers} from "shared/api/circuit/internal/assembly/PortAssembler";


const MULTIPLEXER_HEIGHT_OFFSET = 0.5;
export class MultiplexerAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;

    protected info: DigitalComponentConfigurationInfo;

    public constructor(params: AssemblerParams, sim: DigitalSim, kind: "Multiplexer" | "Demultiplexer") {
        super(params, {
            "inputs": (kind === "Multiplexer"
                ? (_comp, index, total) => ({
                    origin: V(-0.5, -PositioningHelpers.ConstantSpacing(index, total, this.calcHeight(total),
                                                                        { spacing: 0.5, shift: -0.5 })),
                    dir: V(-1, 0),
                })
                : (_comp) => ({ origin: V(-0.5, 0), dir: V(-1, 0) })),
            "outputs": (kind === "Demultiplexer"
                ? (_comp, index, total) => ({
                    origin: V(0.5, -PositioningHelpers.ConstantSpacing(index, total, this.calcHeight(total),
                                                                        { spacing: 0.5, shift: -0.5 })),
                    dir: V(1, 0),
                })
                : (_comp) => ({
                    origin: V(0.5, 0),
                    dir:    V(1, 0),
                })),
            "selects": (_comp, index, total) => {
                const sx = (kind === "Demultiplexer" ? -1 : 1);
                const h = this.calcHeight(Math.pow(2, total));
                const x = PositioningHelpers.ConstantSpacing(index, total, this.calcWidth(total), { spacing: 0.5 });
                return {
                    origin: V(x, -0.5 + MULTIPLEXER_HEIGHT_OFFSET / h * (sx * x + 0.5)),
                    target: V(x, -0.5 - this.options.defaultPortLength / h),
                };
            },
        }, [
            {
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.PortsChanged]),
                assemble:     (comp) => {
                    const sx = (kind === "Demultiplexer" ? -1 : 1);
                    const transform = this.getTransform(comp);
                    return {
                        kind:   "Polygon",
                        points: [
                            transform.toWorldSpace(V(-0.5 * sx, 0.5)),
                            transform.toWorldSpace(V(-0.5 * sx, -0.5)),
                            transform.toWorldSpace(V(0.5 * sx, -0.5 + MULTIPLEXER_HEIGHT_OFFSET / transform.scale.y)),
                            transform.toWorldSpace(V(0.5 * sx, 0.5 - MULTIPLEXER_HEIGHT_OFFSET / transform.scale.y)),
                        ],
                        bounds: transform,
                    }
                },

                styleChangesWhenSelected: true,
                getStyle:                 (comp) => this.options.fillStyle(this.isSelected(comp.id)),
            },
        ], { sizeChangesWhenPortsChange: true });
        this.sim = sim;
        this.info = this.circuit.getComponentInfo(kind).unwrap() as DigitalComponentConfigurationInfo;
    }

    protected calcHeight(inputPortCount: number): number {
        return 1 + inputPortCount / 2;
    }
    protected calcWidth(selectPortCount: number): number {
        return 0.5 + selectPortCount / 2;
    }

    protected override getSize(comp: Schema.Component): Vector {
        const numSelectPorts = this.getSelectPortCount(comp);
        return V(this.calcWidth(numSelectPorts), this.calcHeight(Math.pow(2, numSelectPorts)));
    }

    private getSelectPortCount(comp: Schema.Component) {
        return this.circuit.getPortsByGroup(comp.id).unwrap()["selects"]?.length ?? 2;
    }
}
