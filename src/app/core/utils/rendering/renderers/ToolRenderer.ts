import {ROTATION_CIRCLE_RADIUS,
    ROTATION_CIRCLE_THICKNESS,
    WIRE_THICKNESS} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {Camera} from "math/Camera";

import {CircuitInfo}            from "core/utils/CircuitInfo";
import {CalcSelectionsMidpoint} from "core/utils/CircuitInfoUtils";

import {Renderer}        from "core/utils/rendering/Renderer";
import {Style}           from "core/utils/rendering/Style";
import {ROTATION_ARC_STYLE,
    ROTATION_CIRCLE_COLOR,
    SELECTION_BOX_STYLE} from "core/utils/rendering/Styles";

import {ArcCircle} from "core/utils/rendering/shapes/ArcCircle";
import {Circle}    from "core/utils/rendering/shapes/Circle";
import {Rectangle} from "core/utils/rendering/shapes/Rectangle";

import {DefaultTool}      from "core/tools/DefaultTool";
import {RotateTool}       from "core/tools/RotateTool";
import {SelectionBoxTool} from "core/tools/SelectionBoxTool";
// import {ToolManager}      from "core/tools/ToolManager";
import {WiringTool} from "core/tools/WiringTool";

import {AnyPort} from "core/models/types";

import {GetPortWorldPos} from "core/views/portinfo/utils";

import {Curve} from "../shapes/Curve";


function drawRotationCircleOutline(renderer: Renderer, camera: Camera, pos: Vector): void {
    // Get position, radius, and thickness
    const radius = ROTATION_CIRCLE_RADIUS / camera.getZoom();
    const thickness = ROTATION_CIRCLE_THICKNESS / camera.getZoom();

    renderer.draw(new Circle(pos, radius), new Style(undefined, ROTATION_CIRCLE_COLOR, thickness), 0.5);
}

function drawRotationCircleArc(renderer: Renderer, camera: Camera, pos: Vector, a0: number, a1: number): void {
    // Get position, radius, and angles
    const radius = ROTATION_CIRCLE_RADIUS / camera.getZoom();

    // Draw arc'd circle
    renderer.draw(new ArcCircle(pos, radius, a0, a1), ROTATION_ARC_STYLE, 0.4);
}

function drawWireToMouse(
    renderer: Renderer,
    { camera, circuit, input }: CircuitInfo,
    originPort: AnyPort,
    customWiringToolColor?: (originPort: AnyPort) => string,
): void {
    const { target, dir } = GetPortWorldPos(circuit, originPort);

    const p1 = camera.getScreenPos(target);
    const p2 = input.getMousePos();

    const c1 = p1.add(dir.scale(1 / camera.getZoom()).scale(V(1, -1)));
    const c2 = p2;

    const style = new Style(
        undefined,
        (customWiringToolColor?.(originPort) ?? "#ffffff"),
        WIRE_THICKNESS / camera.getZoom()
    );

    renderer.draw(new Curve(p1, p2, c1, c2), style);
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ToolRenderer {
    export function render(
        renderer: Renderer,
        info: CircuitInfo,
        // This is a hack so that digital wires can draw on/off when being wired
        customWiringToolColor?: (originPort: AnyPort) => string,
    ): void {
        const { camera, circuit, selections, toolManager } = info;

        const tool = toolManager.getCurrentTool();

        const midpoint = CalcSelectionsMidpoint(info, "screen");
        const hasOnlyComponents = selections.all((s) => (circuit.getObj(s)!.baseKind === "Component"));

        if (tool instanceof DefaultTool) {
            // Draw rotation circle outline
            if (hasOnlyComponents && selections.amount() > 0 && toolManager.hasTool(RotateTool))
                drawRotationCircleOutline(renderer, camera, midpoint);
        } else if (tool === SelectionBoxTool) {
            renderer.draw(new Rectangle(SelectionBoxTool.getBounds()), SELECTION_BOX_STYLE, 0.4);
        }
        else if (tool === RotateTool) {
            // Draw rotation circle and outline
            drawRotationCircleOutline(renderer, camera, midpoint);
            drawRotationCircleArc(renderer, camera, midpoint,
                                    RotateTool.getStartAngle(), RotateTool.getPrevAngle());
        }
        else if (tool === WiringTool) {
            // Draw fake wire
            drawWireToMouse(renderer, info, WiringTool.getPort()!, customWiringToolColor);
        }
    }
}
