import {DEBUG_CULLBOXES,
        DEBUG_CULLBOXES_FILL_COLOR,
        DEBUG_CULLBOXES_STROKE_COLOR,
        DEFAULT_FILL_COLOR,
        DEFAULT_ON_COLOR,
        SELECTED_FILL_COLOR,
        WIRE_THICKNESS} from "../../Constants";
import {Renderer} from "../Renderer";
import {Camera} from "../../Camera";
import {Wire} from "../../../models/ioobjects/Wire";

export const WireRenderer = (function() {
    return {
        render(renderer: Renderer, camera: Camera, wire: Wire, selected: boolean) {
            if (!camera.cull(wire.getCullBox()))
                return;

            // @TODO move to function for getting color based on being selection/on/off
            const color = (wire.getIsOn() ? DEFAULT_ON_COLOR : (selected ? SELECTED_FILL_COLOR : DEFAULT_FILL_COLOR));

            // get curve and start/end positions
            const curve = wire.getShape();
            const p1 = camera.getScreenPos(curve.getP1());
            const p2 = camera.getScreenPos(curve.getP2());

            if (wire.isStraight()) {
                renderer.line(p1.x, p1.y, p2.x, p2.y, color, WIRE_THICKNESS / camera.getZoom());
            } else {
                // get bezier points
                const c1 = camera.getScreenPos(curve.getC1());
                const c2 = camera.getScreenPos(curve.getC2());

                renderer.curve(p1.x, p1.y, p2.x, p2.y, c1.x, c1.y, c2.x, c2.y, color, WIRE_THICKNESS / camera.getZoom());
            }

            if (DEBUG_CULLBOXES) {
                renderer.save();
                const cullBox = wire.getCullBox();
                renderer.transform(camera, cullBox);
                renderer.rect(0, 0, cullBox.getSize().x, cullBox.getSize().y, DEBUG_CULLBOXES_FILL_COLOR, DEBUG_CULLBOXES_STROKE_COLOR, 0, 0.5);
                renderer.restore();
            }
        }
    };
})();
