import {DEFAULT_FILL_COLOR,
        DEFAULT_ON_COLOR,
        SELECTED_FILL_COLOR,
        WIRE_THICKNESS} from "../../Constants";
import {Renderer} from "../Renderer";
import {Camera} from "../../Camera";
import {Wire} from "../../../models/ioobjects/Wire";

import {Curve} from "../shapes/Curve";
import {Line} from "../shapes/Line";
import {Style} from "../Style";

export const WireRenderer = (function() {
    return {
        render(renderer: Renderer, camera: Camera, wire: Wire, selected: boolean) {
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
