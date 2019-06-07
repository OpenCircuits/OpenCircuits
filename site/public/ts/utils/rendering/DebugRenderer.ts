import {DEBUG_CULLBOXES,
        DEBUG_CULLBOXES_FILL_COLOR,
        DEBUG_CULLBOXES_STROKE_COLOR,
        DEBUG_SELECTION_BOUNDS,
        DEBUG_SELECTIONS_FILL_COLOR,
        DEBUG_SELECTIONS_STROKE_COLOR,
        IO_PORT_SELECT_RADIUS} from "../Constants";
import {Vector} from "../math/Vector";
import {Renderer} from "./Renderer";
import {Camera} from "../Camera";

import {Wire} from "../../models/ioobjects/Wire";
import {Component} from "../../models/ioobjects/Component";
// import {PressableComponent} from "../../models/ioobjects/PressableComponent";

import {GetAllPorts} from "../ComponentUtils";

export const DebugRenderer = (function() {
    return {
        render(renderer: Renderer, camera: Camera, objects: Array<Component>, wires: Array<Wire>) {

            if (DEBUG_CULLBOXES) {
                const cullboxes = objects.map((c) => c.getCullBox()).concat(wires.map((w) => w.getCullBox()));
                renderer.save();
                for (const cullBox of cullboxes) {
                    renderer.transform(camera, cullBox);
                    renderer.rect(0, 0, cullBox.getSize().x, cullBox.getSize().y,
                                  DEBUG_CULLBOXES_FILL_COLOR, DEBUG_CULLBOXES_STROKE_COLOR, 1, 0.5);
                }
                renderer.restore();
            }

            if (DEBUG_SELECTION_BOUNDS) {
                const ports = GetAllPorts(objects);
                console.log(ports);
                renderer.save();
                for (const port of ports) {
                    const v = port.getTargetPos();
                    renderer.transform(camera, port.getParent().getTransform());
                    renderer.circle(v.x, v.y, IO_PORT_SELECT_RADIUS, DEBUG_SELECTIONS_FILL_COLOR,
                                              DEBUG_SELECTIONS_STROKE_COLOR, 1, 0.5);
                }
                renderer.restore();
            }

        }
    };
})();
