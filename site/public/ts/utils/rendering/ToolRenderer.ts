import {ROTATION_CIRCLE_RADIUS,
        ROTATION_CIRCLE_THICKNESS} from "../Constants";
import {Vector} from "../math/Vector";
import {Renderer} from "./Renderer";
import {Camera} from "../Camera";
import {Tool} from "../tools/Tool";
import {PanTool} from "../tools/PanTool";
import {SelectionTool} from "../tools/SelectionTool";
import {RotateTool} from "../tools/RotateTool";
import {PlaceComponentTool} from "../tools/PlaceComponentTool";

import {ComponentRenderer} from "./ioobjects/ComponentRenderer";

export var ToolRenderer = (function() {

    var drawRotationCircleOutline = function(renderer: Renderer, camera: Camera, midpoint: Vector): void {
        // Get position, radius, and thickness
        let pos = camera.getScreenPos(midpoint);
        let radius = ROTATION_CIRCLE_RADIUS / camera.getZoom();
        let thickness = ROTATION_CIRCLE_THICKNESS / camera.getZoom();

        renderer.circle(pos.x, pos.y, radius, undefined, '#ff0000', thickness, 0.5);
    }

    var drawRotationCircleArc = function(renderer: Renderer, camera: Camera, midpoint: Vector, a0: number, a1: number): void {
        // Get position, radius, and angles
        let pos = camera.getScreenPos(midpoint);
        let radius = ROTATION_CIRCLE_RADIUS / camera.getZoom();

        // Draw arc'd circle
        renderer.arcCircle(pos.x, pos.y, radius, a0, a1, '#ffffff', '#000000', 5, 0.4);
    }

    return {
        render(renderer: Renderer, camera: Camera, tool: Tool) {

            if (tool instanceof SelectionTool) {
                // Draw selection box
                if (tool.isSelecting()) {
                    // Get positions and size
                    let p1 = tool.getP1();
                    let p2 = tool.getP2();
                    let pos = p1.add(p2).scale(0.5);
                    let size = p2.sub(p1);

                    // Draw box
                    renderer.rect(pos.x, pos.y, size.x, size.y, '#ffffff', '#6666ff', 2, 0.4);
                }

                // Draw rotation circle outline
                else if (tool.getSelections().length > 0) {
                    drawRotationCircleOutline(renderer, camera, tool.calculateMidpoint());
                }
            }
            else if (tool instanceof RotateTool) {
                // Draw rotation circle and outline
                if (tool.isRotating()) {
                    drawRotationCircleOutline(renderer, camera, tool.getMidpoint());
                    drawRotationCircleArc(renderer, camera, tool.getMidpoint(), tool.getStartAngle(), tool.getLastAngle());
                }
            }
            else if (tool instanceof PlaceComponentTool) {
                // Draw current object
                let component = tool.getComponent();
                ComponentRenderer.render(renderer, camera, component, false);
            }

        }
    };
})();
