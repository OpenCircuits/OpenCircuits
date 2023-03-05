import {SVGDrawing, blend, parseColor} from "svg2canvas";

import {V}         from "Vector";
import {Transform} from "math/Transform";

import {Schema} from "core/schema";

import {CircuitInternal}   from "core/internal";
import {SelectionsManager} from "core/internal/impl/SelectionsManager";
import {CircuitView}       from "core/internal/view/CircuitView";
import {PortAssembler}     from "core/internal/view/PortAssembler";
import {SVGPrim}           from "core/internal/view/rendering/prims/SVG";
import {Style}             from "core/internal/view/rendering/Style";
import {Assembler}         from "core/internal/view/Assembler";

import {DigitalSim} from "digital/internal/sim/DigitalSim";
import {Signal}     from "digital/internal/sim/Signal";
import {Circle}     from "core/internal/view/rendering/prims/Circle";


export class LEDAssembler extends Assembler<Schema.Component> {
    public readonly size = V(1, 1);
    public readonly img: SVGDrawing;

    protected readonly sim: DigitalSim;

    protected portAssembler: PortAssembler;

    public constructor(circuit: CircuitInternal, view: CircuitView, selections: SelectionsManager, sim: DigitalSim) {
        super(circuit, view, selections);

        this.sim = sim;

        this.img = view.options.getImage("led.svg")!;

        this.portAssembler = new PortAssembler(circuit, view, selections, {
            "inputs": () => ({ origin: V(0, -0.5), target: V(0, -2) }),
        });
    }

    private getColor(led: Schema.Component) {
        return (led.props["color"] ?? "#ffffff") as string;
    }

    private isOn(led: Schema.Component) {
        const [inputPort] = this.circuit.getPortsForComponent(led.id).unwrap();
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
        return new Style(gradient);
    }

    private assembleLight(led: Schema.Component) {
        return new Circle(
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

        if (!transformChanged || !selectionChanged || !colorChanged || !stateChanged)
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
            img.updateStyle(new Style(this.getColor(led)));

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
