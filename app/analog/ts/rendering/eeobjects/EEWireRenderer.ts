import {DEBUG_SHOW_CULLBOXES,
        DEFAULT_FILL_COLOR,
        DEFAULT_ON_COLOR,
        SELECTED_FILL_COLOR,
        WIRE_THICKNESS} from "../../Constants";
import {Renderer} from "../Renderer";
import {Camera} from "../../Camera";
import {EEWire} from "../../../models/eeobjects/EEWire";

export const EEWireRenderer = (function() {
    return {
        render(renderer: Renderer, camera: Camera, wire: EEWire, selected: boolean) {
            if (!camera.cull(wire.getCullBox()))
                return;

            const color = (selected ? SELECTED_FILL_COLOR : DEFAULT_FILL_COLOR);

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

            if (DEBUG_SHOW_CULLBOXES) {
                renderer.save();
                const cullBox = wire.getCullBox();
                renderer.transform(camera, cullBox);
                renderer.rect(0, 0, cullBox.getSize().x, cullBox.getSize().y, '#ff00ff', '#000000', 0, 0.5);
                renderer.restore();
            }
        }
    };
})();
