import {V, Vector} from "Vector";

import {Schema} from "shared/api/circuit/schema";

import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";

import {Signal} from "digital/api/circuit/internal/sim/Signal";
import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";

import {DigitalComponentConfigurationInfo} from "../../DigitalComponents";
import {Transform} from "math/Transform";
import {ComponentAssembler} from "shared/api/circuit/internal/assembly/ComponentAssembler";


export class OscilloscopeAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;
    protected info: DigitalComponentConfigurationInfo;

    public constructor(params: AssemblerParams, sim: DigitalSim) {
        super(params, {
            "inputs": (comp, index, total) => {
                const size = this.getSize(comp);
                const midpoint = (total - 1) / 2;
                const y = -.6 * size.y/2 * (index - midpoint);
                return {
                    // Subtracting the this.options.defaultBorderWidth prevent tiny gap between port stem and component
                    origin: V(-((size.x - this.options.defaultBorderWidth)/2), y),
                    target: V(-(this.options.defaultPortLength + size.x/2), y),
                };
            },
        }, [
            {
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.SignalsChanged, AssemblyReason.PortsChanged]),
                assemble:     (comp) => {
                    const componentTranform = this.getTransform(comp);
                    const size = V(this.getDisplayWidth(comp), this.getDisplayHeight(comp) * this.circuit.getPortsForComponent(comp.id).unwrap().size)
                    return {
                        kind: "Rectangle",

                        transform: new Transform(componentTranform.getPos(), size, componentTranform.getAngle()),
                    }
                },

                styleChangesWhenSelected: true,
                getStyle:                 (comp) => this.options.fillStyle(this.isSelected(comp.id)),
            },
        ]);

        this.sim = sim;
        this.info = this.circuit.getComponentInfo("LED").unwrap() as DigitalComponentConfigurationInfo;
    }

    protected getSize(comp: Schema.Component): Vector {
        return V(this.getDisplayWidth(comp), this.getDisplayHeight(comp) * this.circuit.getPortsForComponent(comp.id).unwrap().size);
    }

    private isOn(led: Schema.Component) {
        const [inputPort] = this.circuit.getPortsForComponent(led.id).unwrap();
        return Signal.isOn(this.sim.getSignal(inputPort));
    }

    private getDisplayHeight(comp: Schema.Component) {
        return this.circuit.getCompByID(comp.id).unwrap().props["h"] as number | undefined ?? 4;
    }

    private getDisplayWidth(comp: Schema.Component) {
        return this.circuit.getCompByID(comp.id).unwrap().props["w"] as number | undefined ?? 8;
    }
}
