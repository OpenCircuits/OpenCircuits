import {DEFAULT_FILL_COLOR,
        DEFAULT_ON_COLOR,
        SELECTED_FILL_COLOR,
        WIRE_THICKNESS} from "core/utils/Constants";
import {Renderer} from "../../../../core/ts/rendering/Renderer";
import {Camera} from "math/Camera";
import {DigitalWire} from "digital/models/DigitalWire";

import {Curve} from "../../../../core/ts/rendering/shapes/Curve";
import {Line} from "../../../../core/ts/rendering/shapes/Line";
import {Style} from "../../../../core/ts/rendering/Style";

export const WireRenderer = (() => {
    return {
        render(renderer: Renderer, camera: Camera, wire: DigitalWire, selected: boolean): void {
            if (!camera.cull(wire.getCullBox()))
                return;

            // @TODO move to function for getting color based on being selection/on/off
            const color = (wire.getIsOn() ? DEFAULT_ON_COLOR : (selected ? SELECTED_FILL_COLOR : DEFAULT_FILL_COLOR));
            const style = new Style(undefined, color, WIRE_THICKNESS / camera.getZoom());

            // get curve and start/end positions
            const curve = wire.getShape();
            const p1 = camera.getScreenPos(curve.getP1());
            const p2 = camera.getScreenPos(curve.getP2());

            if (wire.isStraight()) {
                renderer.draw(new Line(p1, p2), style);
            } else {
                // get bezier points
                const c1 = camera.getScreenPos(curve.getC1());
                const c2 = camera.getScreenPos(curve.getC2());

                renderer.draw(new Curve(p1, p2, c1, c2), style);
            }
        }
    };
})();
