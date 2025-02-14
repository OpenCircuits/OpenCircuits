import {SVGDrawing, blend, parseColor} from "svg2canvas";

import {V}         from "Vector";
import {Transform} from "math/Transform";

import {Schema} from "shared/api/circuit/schema";

import {CircuitInternal}   from "shared/api/circuit/internal";
import {SelectionsManager} from "shared/api/circuit/internal/impl/SelectionsManager";
import {CircuitView}       from "shared/api/circuit/internal/view/CircuitView";
import {PortAssembler}     from "shared/api/circuit/internal/view/PortAssembler";
import {SVGPrim}           from "shared/api/circuit/internal/view/rendering/prims/SVGPrim";
import {Assembler}         from "shared/api/circuit/internal/view/Assembler";
import {CirclePrim}        from "shared/api/circuit/internal/view/rendering/prims/CirclePrim";

import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";
import {Signal}     from "digital/api/circuit/internal/sim/Signal";


export class LEDAssembler extends Assembler<Schema.Component> {
    public readonly size = V(1, 1);

    protected readonly sim: DigitalSim;

    public img?: SVGDrawing;

    protected portAssembler: PortAssembler;

    public constructor(circuit: CircuitInternal, view: CircuitView, selections: SelectionsManager, sim: DigitalSim) {
        super(circuit, view, selections);

        this.sim = sim;

        view.images.subscribe(({ key, val }) => {
            if (key === "led.svg") {
                this.img = val;
                // TODO[model_refactor_api](leon) - Invalidate all AND gates to re-assemble with new image
            }
        });

        this.portAssembler = new PortAssembler(circuit, view, selections, {
            "inputs": () => ({ origin: V(0, -0.5), target: V(0, -2) }),
        });
    }

    private getColor(led: Schema.Component) {
        return (led.props["color"] ?? "#ffffff") as string;
    }

    private isOn(led: Schema.Component) {
        const [inputPort] = this.circuit.doc.getPortsForComponent(led.id).unwrap();
        return Signal.isOn(this.sim.getSignal(inputPort));
    }

    private assembleLightStyle(led: Schema.Component) {
        const selected = this.selections.has(led.id);

        // Parse colors and blend them if selected
        const ledColor = parseColor(this.getColor(led));
        const selectedColor = parseColor(this.options.selectedFillColor);
        const col = (selected ? blend(ledColor, selectedColor, 0.5) : ledColor);

        // Create gradient
        const gradient = this.view.getContextUtils().createRadialGradient(
            V(led.props.x ?? 0, led.props.y ?? 0),
            this.options.ledLightRadius,
        );
        gradient.addColorStop(0.4152, `rgba(${col.r}, ${col.g}, ${col.b}, ${this.options.ledLightIntensity})`);
        gradient.addColorStop(1, `rgba(${col.r}, ${col.g}, ${col.b}, 0)`);
        return { fill: gradient };
    }

    private assembleLight(led: Schema.Component) {
        return new CirclePrim(
            V(led.props.x ?? 0, led.props.y ?? 0),
            this.options.ledLightRadius,
            this.assembleLightStyle(led),
        );
    }

    private assembleImage(led: Schema.Component) {
        return new SVGPrim(this.img, this.size, this.view.componentTransforms.get(led.id)!, this.getColor(led));
    }

    public assemble(led: Schema.Component, ev: unknown) {
        const transformChanged = /* use ev to see if our transform changed */ true;
        const selectionChanged = /* use ev to see if we were de/selected */ true;
        const colorChanged     = /* use ev to see if color prop changed */ true;
        const stateChanged     = /* use ev to see if the sim state changed for the LED */ true;

        if (!transformChanged && !selectionChanged && !colorChanged && !stateChanged)
            return;

        if (transformChanged) {
            // Update transform
            this.view.componentTransforms.set(led.id, new Transform(
                V(led.props.x ?? 0, led.props.y ?? 0),
                this.size,
                (led.props.angle ?? 0),
            ));
        }

        this.portAssembler.assemble(led, ev);

        const [prevImg, prevLight] = (this.view.componentPrims.get(led.id) ?? []);
        const isOn = this.isOn(led);

        const img = ((!prevImg || transformChanged) ? this.assembleImage(led) : prevImg);

        // Update light only if color changed
        if (colorChanged)
            img.updateStyle({ fill: this.getColor(led) });

        // Just set the img if the light isn't on
        if (!isOn) {
            this.view.componentPrims.set(led.id, [img]);
            return;
        }

        // Assemble light if it's on
        const light = ((!prevLight || transformChanged) ? this.assembleLight(led) : prevLight);

        // Update light style if selection or color changed
        if (selectionChanged || colorChanged)
            light.updateStyle(this.assembleLightStyle(led));

        this.view.componentPrims.set(led.id, [img, light]);
    }
}
