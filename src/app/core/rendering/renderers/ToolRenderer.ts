import {ROTATION_ARC_STYLE,
        ROTATION_CIRCLE_COLOR,
        SELECTION_BOX_STYLE} from "core/rendering/Styles";
import {ROTATION_CIRCLE_RADIUS,
        ROTATION_CIRCLE_THICKNESS} from "core/utils/Constants";

import {Vector} from "Vector";

import {Camera} from "math/Camera";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {InteractionTool}  from "core/tools/InteractionTool";
import {RotateTool}       from "core/tools/RotateTool";
import {SelectionBoxTool} from "core/tools/SelectionBoxTool";
import {ToolManager}      from "core/tools/ToolManager";
import {WiringTool}       from "core/tools/WiringTool";

import {Renderer} from "core/rendering/Renderer";
import {Style}    from "core/rendering/Style";

import {ArcCircle} from "core/rendering/shapes/ArcCircle";
import {Circle}    from "core/rendering/shapes/Circle";
import {Rectangle} from "core/rendering/shapes/Rectangle";

import {Component} from "core/models";

import {WireRenderer} from "./WireRenderer";


export const ToolRenderer = (() => {

    const drawRotationCircleOutline = function(renderer: Renderer, camera: Camera, midpoint: Vector): void {
        // Get position, radius, and thickness
        const pos = camera.getScreenPos(midpoint);
        const radius = ROTATION_CIRCLE_RADIUS / camera.getZoom();
        const thickness = ROTATION_CIRCLE_THICKNESS / camera.getZoom();

        renderer.draw(new Circle(pos, radius), new Style(undefined, ROTATION_CIRCLE_COLOR, thickness), 0.5);
    }

    const drawRotationCircleArc = function(renderer: Renderer, camera: Camera, midpoint: Vector,
                                           a0: number, a1: number): void {
        // Get position, radius, and angles
        const pos = camera.getScreenPos(midpoint);
        const radius = ROTATION_CIRCLE_RADIUS / camera.getZoom();

        // Draw arc'd circle
        renderer.draw(new ArcCircle(pos, radius, a0, a1), ROTATION_ARC_STYLE, 0.4);
    }

    return {
        render(renderer: Renderer, info: CircuitInfo, toolManager: ToolManager): void {
            const { camera, selections } = info;

            const tool = toolManager.getCurrentTool();

            const hasOnlyComponents = selections.all((s) => s instanceof Component);
            const midpoint = selections.midpoint();

            if (tool instanceof InteractionTool) {
                // Draw rotation circle outline
                if (hasOnlyComponents && selections.amount() > 0 && toolManager.hasTool(RotateTool)) {
                    drawRotationCircleOutline(renderer, camera, midpoint);
                }
            } else if (tool === SelectionBoxTool) {
                const p1 = SelectionBoxTool.getP1();
                const p2 = SelectionBoxTool.getP2();
                const pos = p1.add(p2).scale(0.5);
                const size = p2.sub(p1);

                renderer.draw(new Rectangle(pos, size), SELECTION_BOX_STYLE, 0.4);
            }
            else if (tool === RotateTool) {
                // Draw rotation circle and outline
                if (hasOnlyComponents) {
                    drawRotationCircleOutline(renderer, camera, midpoint);
                    drawRotationCircleArc(renderer, camera, midpoint,
                                          RotateTool.getStartAngle(), RotateTool.getPrevAngle());
                }
            }
            else if (tool === WiringTool) {
                // Draw fake wire
                WireRenderer.render(renderer, info, WiringTool.getWire());
            }
        },
    };
})();
