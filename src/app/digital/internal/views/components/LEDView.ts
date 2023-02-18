import {blend, parseColor} from "svg2canvas";

import {V, Vector} from "Vector";

import {Rect} from "math/Rect";

import {GUID}                          from "core/internal";
import {ComponentView, PartialPortPos} from "core/internal/view/ComponentView";
import {RenderState}                   from "core/internal/view/rendering/RenderState";
import {Circle}                        from "core/internal/view/rendering/shapes/Circle";
import {Style}                         from "core/internal/view/rendering/Style";


export class LEDView extends ComponentView {
    public constructor(compID: GUID, state: RenderState) {
        super(compID, state, "led.svg");
    }

    protected get color(): string {
        return (this.component.props["color"] as string);
    }

    protected get isOn(): boolean {
        return false; // TODO
    }

    protected override drawImg(): void {
        const { renderer, options } = this.state;

        // Draw the LED with its color as the tint
        renderer.image(this.img!, V(), this.size, this.color);

        // Draw LED light
        if (this.isOn) {
            // Parse colors and blend them if selected
            const ledColor = parseColor(this.color);
            const selectedColor = parseColor(options.selectedFillColor);
            const col = (this.isSelected ? blend(ledColor, selectedColor, 0.5) : ledColor);

            // Create gradient
            const gradient = renderer.createRadialGradient(V(), 0, V(), options.ledLightRadius);
            gradient.addColorStop(0.4152, `rgba(${col.r}, ${col.g}, ${col.b}, ${options.ledLightIntensity})`);
            gradient.addColorStop(1, `rgba(${col.r}, ${col.g}, ${col.b}, 0)`);

            // Draw circle w/ gradient as fill
            renderer.draw(new Circle(V(), options.ledLightRadius), new Style(gradient));
        }
    }

    protected calcPortPosition(group: string, index: number): PartialPortPos {
        if (group !== "inputs")
            throw new Error(`ANDGateView: Unknown group ${group}!`);
        return { origin: V(0, -0.5), target: V(0, -2), dir: V(0, -1) };
    }

    protected override getBounds(): Rect {
        throw new Error("Method not implemented.");
    }

    protected override get size(): Vector {
        return V(1, 1);
    }
}
