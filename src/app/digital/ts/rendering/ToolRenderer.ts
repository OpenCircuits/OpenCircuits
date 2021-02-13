import {ROTATION_CIRCLE_RADIUS,
        ROTATION_CIRCLE_THICKNESS} from "core/utils/Constants";
import {ROTATION_CIRCLE_COLOR,
        ROTATION_ARC_STYLE,
        SELECTION_BOX_STYLE} from "core/rendering/Styles";

import {Vector} from "Vector";
import {Camera} from "math/Camera";

import {Renderer} from "core/rendering/Renderer";
import {Style} from "core/rendering/Style";
import {ArcCircle} from "core/rendering/shapes/ArcCircle";
import {Circle} from "core/rendering/shapes/Circle";
import {Rectangle} from "core/rendering/shapes/Rectangle";

import {ToolManager} from "core/tools/ToolManager";
import {SelectionTool} from "core/tools/SelectionTool";
import {RotateTool} from "core/tools/RotateTool";
import {PlaceComponentTool} from "core/tools/PlaceComponentTool";
import {WiringTool} from "core/tools/WiringTool";

import {ComponentRenderer} from "./ioobjects/ComponentRenderer";
import {WireRenderer} from "./ioobjects/WireRenderer";

import {Component} from "core/models/Component";
import {DigitalWire} from "digital/models/DigitalWire";

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

            const selectionTool = toolManager.getDefaultTool() as SelectionTool;

            // If a wire has been selected, then don't draw the rotation box
            const selections = selectionTool.getSelections();
            const hasOnlyComponents = selections.every((s) => s instanceof Component);

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
                else if (hasOnlyComponents && tool.getSelections().length > 0 && toolManager.hasTool(RotateTool)) {
                    drawRotationCircleOutline(renderer, camera, tool.calculateMidpoint());
                }
            }
            else if (tool instanceof RotateTool) {
                // Draw rotation circle and outline
                if (hasOnlyComponents) {
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
                WireRenderer.render(renderer, camera, tool.getWire() as DigitalWire, false);
            }

        }
    };
})();
