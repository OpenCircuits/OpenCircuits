import {blend, parseColor} from "svg2canvas";

import {V, Vector} from "Vector";

import {Schema} from "shared/api/circuit/schema";

import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {ComponentAssembler}              from "shared/api/circuit/internal/assembly/ComponentAssembler";
import {Style}                           from "shared/api/circuit/internal/assembly/Style";

import {Signal} from "digital/api/circuit/internal/sim/Signal";
import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";

import {DigitalComponentConfigurationInfo} from "../../DigitalComponents";


export class LEDAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;

    protected info: DigitalComponentConfigurationInfo;

    public constructor(params: AssemblerParams, sim: DigitalSim) {
        super(params, {
            "inputs": () => ({ origin: V(0, - 0.5), target: V(0, -2) }),
        }, [
            {
                kind: "SVG",

                dependencies: new Set([AssemblyReason.TransformChanged]),
                assemble: (comp) => ({ kind: "SVG", svg: "led.svg", transform: this.getTransform(comp) }),

                tintChangesWhenSelected: true,
                getTint: (comp) => (this.isSelected(comp.id) ? this.options.selectedFillColor : undefined),
            },
            {
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.SignalsChanged]),
                assemble: (led) => ({
                    kind: "Group",

                    prims: (!this.isOn(led) ? [] : [{
                        kind:   "Circle",
                        pos:    this.getPos(led),
                        radius: this.options.ledLightRadius,

                        ignoreHit: true,
                    }]),

                    ignoreHit: true,
                }),

                styleChangesWhenSelected: true,
                getStyle: (led) => this.assembleLightStyle(led),
            },
        ]);

        this.sim = sim;
        this.info = this.circuit.getComponentInfo("LED").unwrap() as DigitalComponentConfigurationInfo;
    }

    protected override getSize(_: Schema.Component): Vector {
        return V(1, 1);
    }

    private isOn(led: Schema.Component) {
        const [inputPort] = this.circuit.getPortsForComponent(led.id).unwrap();
        return Signal.isOn(this.sim.getSignal(inputPort));
    }

    private assembleLightStyle(led: Schema.Component) {
        const selected = this.isSelected(led.id);

        // Parse colors and blend them if selected
        const ledColor = parseColor(this.getColor(led));
        const selectedColor = parseColor(this.options.selectedFillColor);
        const col = (selected ? blend(ledColor, selectedColor, 0.5) : ledColor);

        return {
            fill: {
                pos1:    this.getPos(led),
                radius1: 0,
                pos2:    this.getPos(led),
                radius2: this.options.ledLightRadius,

                colorStops: [
                    [0.4152, `rgba(${col.r}, ${col.g}, ${col.b}, ${this.options.ledLightIntensity})`],
                    [1,      `rgba(${col.r}, ${col.g}, ${col.b}, 0)`],
                ],
            },
        } satisfies Style;
    }

    private getColor(led: Schema.Component) {
        return (led.props["color"] ?? "#ffffff") as string;
    }
}
