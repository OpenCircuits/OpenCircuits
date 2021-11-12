import {blend, parseColor, Color} from "svg2canvas";

import {DEFAULT_FILL_COLOR,
        DEFAULT_ON_COLOR,
        SELECTED_FILL_COLOR,
        WIRE_THICKNESS} from "core/utils/Constants";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {Style} from "core/rendering/Style";
import {Curve} from "core/rendering/shapes/Curve";
import {Renderer} from "core/rendering/Renderer";

import {DigitalWire} from "digital/models/DigitalWire";


// @TODO @leon - Move this function to "svg2canvas"
function ColorToHex(col: Color): string {
    return `#${[col.r, col.g, col.b].map(x => {
        const hex = Math.round(x).toString(16);
        return (hex.length === 1 ? '0'+hex : hex);
    }).join('')}`
}

/**
 * Renders Wires
 * * Check if wire is on screen, quit render if not
 * * Set wire colour - prioritize on colour, else colour as selection status
 * * Calculate Wire Bezier Curve
 * * Draw
 */
export const WireRenderer = (() => {
    return {
        render(renderer: Renderer, {camera, selections}: CircuitInfo, wire: DigitalWire): void {
            if (!camera.cull(wire.getCullBox()))
                return;

            const selected = selections.has(wire);

            // Changes color of wires: when wire is selected it changes to the color 
            //  selected blended with constant color SELECTED_FILL_COLOR
            const selectedColor = ColorToHex(blend(
                    parseColor(wire.getColor()), 
                    parseColor(SELECTED_FILL_COLOR), 0.2
            ));
                
            // @TODO move to function for getting color based on being selection/on/off
            const color = (wire.getIsOn() ? DEFAULT_ON_COLOR : (selected ? selectedColor : wire.getColor()));
            const style = new Style(undefined, color, WIRE_THICKNESS / camera.getZoom());

            // get curve and start/end positions
            const curve = wire.getShape();
            const p1 = camera.getScreenPos(curve.getP1());
            const p2 = camera.getScreenPos(curve.getP2());

            // get bezier points
            const c1 = camera.getScreenPos(curve.getC1());
            const c2 = camera.getScreenPos(curve.getC2());

            renderer.draw(new Curve(p1, p2, c1, c2), style);
        },
        renderAll(renderer: Renderer, info: CircuitInfo, wires: DigitalWire[]): void {
            for (const wire of wires)
                WireRenderer.render(renderer, info, wire);
        }
    };
})();
