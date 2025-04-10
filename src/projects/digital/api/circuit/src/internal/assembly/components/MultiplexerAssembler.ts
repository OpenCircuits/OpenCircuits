import {V, Vector} from "Vector";

import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {DigitalComponentConfigurationInfo} from "../../DigitalComponents";
import {ComponentAssembler} from "shared/api/circuit/internal/assembly/ComponentAssembler";
import {Schema} from "shared/api/circuit/schema";


const MULTIPLEXER_HEIGHT_OFFSET = 0.5;
export class MultiplexerAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;

    protected info: DigitalComponentConfigurationInfo;

    public constructor(params: AssemblerParams, sim: DigitalSim) {
        super(params, {
            "inputs": (comp, index, total) => ({
                origin: V(-this.getSize(comp).x/2, -(index - ((total - 1) / 2)) / 2 + .25),
                dir:    V(-1, 0),
            }),
            "outputs": (comp) => ({
                origin: V(this.getSize(comp).x/2, 0),
                dir:    V(1, 0),
            }),
            "selects": (comp, index, total) => {
                const { x: width, y: height } = this.getSize(comp)
                const slope = -MULTIPLEXER_HEIGHT_OFFSET / width;
                const midPortOriginOffset = -height/2 + MULTIPLEXER_HEIGHT_OFFSET/2;
                const x = (index - ((total - 1) / 2)) / 2;
                const y = midPortOriginOffset - slope * x;
                return {
                    origin: V(x, y),
                    target: V(x, -height/2 - this.options.defaultPortLength),
                }
            },
        }, [
            {
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.PortsChanged]),
                assemble:     (comp) => {
                    const { x, y } = this.getSize(comp);
                    const pos = this.getPos(comp);
                    return {
                        kind:   "Polygon",
                        points: [
                            V(-x/2, y/2).add(pos),
                            V(-x/2, -y/2).add(pos),
                            V(x/2, -y/2 + MULTIPLEXER_HEIGHT_OFFSET).add(pos),
                            V(x/2, y/2 - MULTIPLEXER_HEIGHT_OFFSET).add(pos),
                        ],
                    }
                },

                styleChangesWhenSelected: true,
                getStyle:                 (comp) => this.options.fillStyle(this.isSelected(comp.id)),
            },
        ]);
        this.sim = sim;
        this.info = this.circuit.getComponentInfo("Multiplexer").unwrap() as DigitalComponentConfigurationInfo;
    }

    protected override getSize(comp: Schema.Component): Vector {
        const numSelectPorts = this.getSelectPortCount(comp);
        return V((0.5 + numSelectPorts/2), (1 + Math.pow(2, numSelectPorts - 1)));
    }

    private getSelectPortCount(comp: Schema.Component) {
        return this.circuit.getPortsByGroup(comp.id).unwrap()["selects"]?.length ?? 2;
    }
}
