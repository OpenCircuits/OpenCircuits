import {blend, parseColor} from "svg2canvas";

import {LED_LIGHT_INTENSITY, LED_LIGHT_RADIUS, SELECTED_FILL_COLOR} from "core/utils/Constants";

import {V} from "Vector";

import {Rect} from "math/Rect";

import {Style} from "core/utils/rendering/Style";

import {Circle} from "core/utils/rendering/shapes/Circle";

import {DigitalPort, LED} from "core/models/types/digital";

import {Signal} from "digital/models/sim/Signal";

import {RenderInfo}    from "core/views/BaseView";
import {ComponentView} from "core/views/ComponentView";

import {DigitalViewInfo} from "../DigitalViewInfo";


export class LEDView extends ComponentView<LED, DigitalViewInfo> {
    public constructor(info: DigitalViewInfo, obj: LED) {
        super(info, obj, V(1, 1), "led.svg");
    }

    public getInputPort(): DigitalPort {
        return this.circuit.getPortsFor(this.obj)[0];
    }

    public getInputSignal(): Signal {
        return this.info.sim.getSignal(this.getInputPort());
    }

    protected override drawImg({ renderer, selections }: RenderInfo): void {
        const selected = selections.has(this.obj.id);

        // Draw the LED with its color as the tint
        renderer.image(this.img!, V(), this.getSize(), this.obj.color);

        // Draw LED light
        if (Signal.isOn(this.getInputSignal())) {
            // Parse colors and blend them if selected
            const ledColor = parseColor(this.obj.color);
            const selectedColor = parseColor(SELECTED_FILL_COLOR!);
            const col = (selected ? blend(ledColor, selectedColor, 0.5) : ledColor);

            // Create gradient
            const gradient = renderer.createRadialGradient(V(), 0, V(), LED_LIGHT_RADIUS);
            gradient.addColorStop(0.4152, `rgba(${col.r}, ${col.g}, ${col.b}, ${LED_LIGHT_INTENSITY})`);
            gradient.addColorStop(1, `rgba(${col.r}, ${col.g}, ${col.b}, 0)`);

            // Draw circle w/ gradient as fill
            renderer.draw(new Circle(V(), LED_LIGHT_RADIUS), new Style(gradient));
        }
    }

    protected override getBounds(): Rect {
        if (Signal.isOn(this.getInputSignal()))
            return super.getBounds().expand(V(LED_LIGHT_RADIUS));
        return super.getBounds();
    }
}
