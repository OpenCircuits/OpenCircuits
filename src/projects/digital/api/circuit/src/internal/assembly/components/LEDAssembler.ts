import {V} from "Vector";

import {Schema} from "shared/api/circuit/schema";

import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";
import {ComponentAssembler} from "shared/api/circuit/internal/assembly/ComponentAssembler";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {DigitalComponentInfo} from "../../DigitalComponents";


export class LEDAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;

    protected info: DigitalComponentInfo;

    public constructor(params: AssemblerParams, sim: DigitalSim) {
        super(params, V(1, 1), {
            "inputs": () => ({origin: V(0, - 0.5), target: V(0, -2)})
        }, [
            {
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged]),
                assemble: (comp) => ({
                    kind: "Circle",
                    pos: V(comp.props.x ?? 0, comp.props.y ?? 0),
                    radius: this.options.ledLightRadius,
                    // TODO: Get styling for on/off status and gradient working
                    // style: this.assembleLightStyle(led),
                }),

                getStyle: (comp) => this.options.curveStyle(this.isSelected(comp.id))
            },
            {
                kind: "SVG",

                dependencies: new Set([AssemblyReason.TransformChanged]),
                assemble: (comp) => ({kind: "SVG", svg: "led.svg", transform: this.getTransform(comp)}),
                getTint: (comp) => (this.isSelected(comp.id) ? this.options.selectedFillColor : undefined)
            },
        ]);

        this.sim = sim;
        this.info = this.circuit.doc.getObjectInfo("LED").unwrap() as DigitalComponentInfo;
    }

    // private assembleLightStyle(led: Schema.Component) {
    //     // return {
    //     //     kind: "Circle",
    //     //     pos: V(led.props.x ?? 0, led.props.y ?? 0),
    //     //     radius: this.options.ledLightRadius,
    //     //     style: this.assembleLightStyle(led),
    //     // } as const
    //     const selected = this.selections.has(led.id);

    //     // Parse colors and blend them if selected
    //     const ledColor = parseColor(this.getColor(led));
    //     const selectedColor = parseColor(this.options.selectedFillColor);
    //     const col = (selected ? blend(ledColor, selectedColor, 0.5) : ledColor);

    //     // Create gradient
    //     const gradient = this.view.getContextUtils().createRadialGradient(
    //         V(led.props.x ?? 0, led.props.y ?? 0),
    //         this.options.ledLightRadius,
    //     );
    //     gradient.addColorStop(0.4152, `rgba(${col.r}, ${col.g}, ${col.b}, ${this.options.ledLightIntensity})`);
    //     gradient.addColorStop(1, `rgba(${col.r}, ${col.g}, ${col.b}, 0)`);
    //     return {fill: gradient};
    // }

    //     view.images.subscribe(({ key, val }) => {
    //         if (key === "led.svg") {
    //             this.img = val;
    //             // TODO[model_refactor_api](leon) - Invalidate all AND gates to re-assemble with new image
    //         }
    //     });

    private getColor(led: Schema.Component) {
        return (led.props["color"] ?? "#ffffff") as string;
    }

    // private isOn(led: Schema.Component) {
    //     const [inputPort] = this.circuit.doc.getPortsForComponent(led.id).unwrap();
    //     return Signal.isOn(this.sim.getSignal(inputPort));
    // }

    // private assembleLightStyle(led: Schema.Component) {
    //     const selected = this.selections.has(led.id);

    //     // Parse colors and blend them if selected
    //     const ledColor = parseColor(this.getColor(led));
    //     const selectedColor = parseColor(this.options.selectedFillColor);
    //     const col = (selected ? blend(ledColor, selectedColor, 0.5) : ledColor);

    //     // Create gradient
    //     const gradient = this.view.getContextUtils().createRadialGradient(
    //         V(led.props.x ?? 0, led.props.y ?? 0),
    //         this.options.ledLightRadius,
    //     );
    //     gradient.addColorStop(0.4152, `rgba(${col.r}, ${col.g}, ${col.b}, ${this.options.ledLightIntensity})`);
    //     gradient.addColorStop(1, `rgba(${col.r}, ${col.g}, ${col.b}, 0)`);
    //     return {fill: gradient};
    // }

    // public assemble(led: Schema.Component, ev: unknown) {
    //     const transformChanged = /* use ev to see if our transform changed */ true;
    //     const selectionChanged = /* use ev to see if we were de/selected */ true;
    //     const colorChanged = /* use ev to see if color prop changed */ true;
    //     const stateChanged = /* use ev to see if the sim state changed for the LED */ true;

    //     if (!transformChanged && !selectionChanged && !colorChanged && !stateChanged)
    //         return;

    //     if (transformChanged) {
    //         // Update transform
    //         this.view.componentTransforms.set(led.id, new Transform(
    //             V(led.props.x ?? 0, led.props.y ?? 0),
    //             this.size,
    //             (led.props.angle ?? 0),
    //         ));
    //     }

    //     this.portAssembler.assemble(led, ev);

    //     const [prevImg, prevLight] = (this.view.componentPrims.get(led.id) ?? []);
    //     const isOn = this.isOn(led);

    //     const img = ((!prevImg || transformChanged) ? this.assembleImage(led) : prevImg);

    //     // Update light only if color changed
    //     if (colorChanged)
    //         img.updateStyle({fill: this.getColor(led)});

    //     // Just set the img if the light isn't on
    //     if (!isOn) {
    //         this.view.componentPrims.set(led.id, [img]);
    //         return;
    //     }

    //     // Assemble light if it's on
    //     const light = ((!prevLight || transformChanged) ? this.assembleLight(led) : prevLight);

    //     // Update light style if selection or color changed
    //     if (selectionChanged || colorChanged)
    //         light.updateStyle(this.assembleLightStyle(led));

    //     this.view.componentPrims.set(led.id, [img, light]);
    // }
}
