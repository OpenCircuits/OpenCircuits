import {DEBUG_CULLBOXES,
        DEBUG_SELECTION_BOUNDS,
        IO_PORT_SELECT_RADIUS} from "../Constants";
import {DEBUG_CULLBOX_STYLE,
        DEBUG_SELECTION_BOUNDS_STYLE} from "./Styles";

import {Renderer} from "./Renderer";
import {Camera} from "../Camera";

import {Wire} from "../../models/ioobjects/Wire";
import {Component} from "../../models/ioobjects/Component";

import {GetAllPorts} from "../ComponentUtils";

import {Circle} from "./shapes/Circle";
import {Rectangle} from "./shapes/Rectangle";

export const DebugRenderer = (function() {
    return {
        render(renderer: Renderer, camera: Camera, objects: Array<Component>, wires: Array<Wire>) {

            if (DEBUG_CULLBOXES) {
                const cullboxes = objects.map((c) => c.getCullBox()).concat(wires.map((w) => w.getCullBox()));
                renderer.save();
                for (const cullBox of cullboxes) {
                    renderer.transform(camera, cullBox);
                    renderer.draw(new Rectangle(cullBox), DEBUG_CULLBOX_STYLE, 0.5);
                    // new Rectangle(V(), cullBox.getSize())
                }
                renderer.restore();
            }

            if (DEBUG_SELECTION_BOUNDS) {
                const ports = GetAllPorts(objects);
                renderer.save();
                for (const port of ports) {
                    const v = port.getTargetPos();
                    renderer.transform(camera, port.getParent().getTransform());
                    renderer.draw(new Circle(v, IO_PORT_SELECT_RADIUS), DEBUG_SELECTION_BOUNDS_STYLE, 0.5);
                    // renderer.circle(v.x, v.y, IO_PORT_SELECT_RADIUS, DEBUG_SELECTIONS_FILL_COLOR,
                    //                           DEBUG_SELECTIONS_STROKE_COLOR, 1, 0.5);
                }
                renderer.restore();
            }

        }
    };
})();
