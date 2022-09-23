import {ROTATION_CIRCLE_RADIUS,
    ROTATION_CIRCLE_THICKNESS} from "core/utils/Constants";

import {Vector} from "Vector";

import {Camera}            from "math/Camera";
import {CalculateMidpoint} from "math/MathUtils";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {Renderer}        from "core/utils/rendering/Renderer";
import {Style}           from "core/utils/rendering/Style";
import {ROTATION_ARC_STYLE,
    ROTATION_CIRCLE_COLOR,
    SELECTION_BOX_STYLE} from "core/utils/rendering/Styles";

import {ArcCircle} from "core/utils/rendering/shapes/ArcCircle";
import {Circle}    from "core/utils/rendering/shapes/Circle";
import {Rectangle} from "core/utils/rendering/shapes/Rectangle";

import {InteractionTool}  from "core/tools/InteractionTool";
import {RotateTool}       from "core/tools/RotateTool";
import {SelectionBoxTool} from "core/tools/SelectionBoxTool";
import {ToolManager}      from "core/tools/ToolManager";
import {WiringTool}       from "core/tools/WiringTool";

// import {WireRenderer} from "./WireRenderer";



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

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ToolRenderer {
    export function render(renderer: Renderer, info: CircuitInfo): void {
        const { camera, selections, toolManager, viewManager } = info;

        const tool = toolManager.getCurrentTool();

        // const hasOnlyComponents = selections.all((s) => s instanceof Component);
        const midpoint = CalculateMidpoint(
            selections.get()
                .map((id) => viewManager.getView(id).getMidpoint())
        );

        if (tool instanceof InteractionTool) {
            // // Draw rotation circle outline
            // if (hasOnlyComponents && selections.amount() > 0 && toolManager.hasTool(RotateTool)) {
            //     drawRotationCircleOutline(renderer, camera, midpoint);
            // }
        } else if (tool === SelectionBoxTool) {
            renderer.draw(new Rectangle(SelectionBoxTool.getBounds()), SELECTION_BOX_STYLE, 0.4);
        }
        // else if (tool === RotateTool) {
        //     // Draw rotation circle and outline
        //     if (hasOnlyComponents) {
        //         drawRotationCircleOutline(renderer, camera, midpoint);
        //         drawRotationCircleArc(renderer, camera, midpoint,
        //                               RotateTool.getStartAngle(), RotateTool.getPrevAngle());
        //     }
        // }
        // else if (tool === WiringTool) {
        //     // Draw fake wire
        //     WireRenderer.render(renderer, info, WiringTool.getWire());
        // }
    }
}
