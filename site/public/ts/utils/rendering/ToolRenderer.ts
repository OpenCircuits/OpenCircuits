import {ROTATION_CIRCLE_RADIUS,
        ROTATION_CIRCLE_THICKNESS} from "../Constants";
import {ROTATION_CIRCLE_COLOR,
        ROTATION_ARC_STYLE,
        SELECTION_BOX_STYLE} from "./Styles";
import {Vector} from "../math/Vector";
import {Renderer} from "./Renderer";
import {Camera} from "../Camera";
import {ToolManager} from "../tools/ToolManager";
import {SelectionTool} from "../tools/SelectionTool";
import {RotateTool} from "../tools/RotateTool";
import {PlaceComponentTool} from "../tools/PlaceComponentTool";
import {WiringTool} from "../tools/WiringTool";

import {ComponentRenderer} from "./ioobjects/ComponentRenderer";
import {WireRenderer} from "./ioobjects/WireRenderer";
import {Wire} from "../../models/ioobjects/Wire";

import {Style} from "./Style";
import {ArcCircle} from "./shapes/ArcCircle";
import {Circle} from "./shapes/Circle";
import {Rectangle} from "./shapes/Rectangle";

export const ToolRenderer = (() => {

    const drawRotationCircleOutline = function(renderer: Renderer, camera: Camera, midpoint: Vector): void {
        // Get position, radius, and thickness
        const pos = camera.getScreenPos(midpoint);
        const radius = ROTATION_CIRCLE_RADIUS / camera.getZoom();
        const thickness = ROTATION_CIRCLE_THICKNESS / camera.getZoom();

        renderer.draw(new Circle(pos, radius),
                      new Style(undefined, ROTATION_CIRCLE_COLOR, thickness), 0.5);
    }

    const drawRotationCircleArc = function(renderer: Renderer, camera: Camera, midpoint: Vector, a0: number, a1: number): void {
        // Get position, radius, and angles
        const pos = camera.getScreenPos(midpoint);
        const radius = ROTATION_CIRCLE_RADIUS / camera.getZoom();

        // Draw arc'd circle
        renderer.draw(new ArcCircle(pos, radius, a0, a1), ROTATION_ARC_STYLE, 0.4);
    }

    return {
        render(renderer: Renderer, camera: Camera, toolManager: ToolManager): void {
            const tool = toolManager.getCurrentTool();

            // If a wire has been selected, then don't draw the rotation box
            const selections = toolManager.getSelectionTool().getSelections();
            const hasWire = selections.some((o) => o instanceof Wire);

            if (tool instanceof SelectionTool) {
                 const selectionBox = tool.getSelectionBox();

                // Draw selection box
                if (selectionBox.isSelecting()) {
                    // Get positions and size
                    const p1 = selectionBox.getP1();
                    const p2 = selectionBox.getP2();
                    const pos = p1.add(p2).scale(0.5);
                    const size = p2.sub(p1);

                    // Draw box
                    renderer.draw(new Rectangle(pos, size), SELECTION_BOX_STYLE, 0.4);
                }

                // Draw rotation circle outline
                else if (!hasWire && tool.getSelections().length > 0 && toolManager.hasTool(RotateTool)) {
                    drawRotationCircleOutline(renderer, camera, tool.calculateMidpoint());
                }
            }
            else if (tool instanceof RotateTool) {
                // Draw rotation circle and outline
                if (!hasWire) {
                    drawRotationCircleOutline(renderer, camera, tool.getMidpoint());
                    drawRotationCircleArc(renderer, camera, tool.getMidpoint(), tool.getStartAngle(), tool.getPrevAngle());
                }
            }
            else if (tool instanceof PlaceComponentTool) {
                // Draw current object
                const component = tool.getComponent();

                ComponentRenderer.render(renderer, camera, component, false, []);
            }
            else if (tool instanceof WiringTool) {
                // Draw fake wire
                const wire = tool.getWire();
                if (wire.getInput() != null)
                    wire.activate(wire.getInput().getIsOn());
                WireRenderer.render(renderer, camera, wire, false);
            }

        }
    };
})();
