import {blend, parseColor} from "svg2canvas";

import {LED_LIGHT_RADIUS,
        LED_LIGHT_INTENSITY,
        SELECTED_FILL_COLOR} from "core/utils/Constants";

import {V} from "Vector";

import {Camera} from "math/Camera";

import {Renderer} from "core/rendering/Renderer";
import {Style} from "core/rendering/Style";

import {LED} from "digital/models/ioobjects";

import {Images} from "digital/utils/Images";
import {Circle} from "core/rendering/shapes/Circle";

/**
 * Renders LEDs
 * * Draws LED svg
 * * If LED is on, draws glow the appropriate colour
 */
export const LEDRenderer = (() => {
    return {
        render(renderer: Renderer, _: Camera, led: LED, selected: boolean): void {
            const size = led.getSize();

            // draw the LED object
            renderer.image(Images.GetImage(led.getImageName())!, V(), size, led.getColor());

            // draw the LED glow
            if (led.isOn()) {
                // Parse colors and blend them if selected
                const ledColor = parseColor(led.getColor());
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
    };
})();
