import {BezierCurve} from "math/BezierCurve";

import {WiringTool} from "../WiringTool";

import {ToolRenderer, ToolRendererArgs} from "./ToolRenderer";
import {RenderOptions}                  from "core/internal/view/rendering/RenderOptions";


/**
 * WiringToolRenderer is a class since Wire colors need to be specified
 *  as they change per-project.
 */
export class WiringToolRenderer implements ToolRenderer {
    protected getColor(options: RenderOptions, _: WiringTool): string | undefined {
        return options.defaultWireColor;
    }

    public render({ renderer, options, circuit, curTool, input }: ToolRendererArgs) {
        // If a non-selection-box-tool active, then do nothing
        if (!(curTool instanceof WiringTool))
            return;

        const port = curTool.getCurPort();
        if (!port)
            return;

        const mousePos = circuit.camera.toWorldPos(input.mousePos);
        const curve = new BezierCurve(port.targetPos, mousePos, port.targetPos.add(port.dir.scale(1)), mousePos);

        renderer.save();

        renderer.setStyle(options.wireStyle(false, this.getColor(options, curTool)));

        renderer.beginPath();
        renderer.moveTo(curve.p1)
        renderer.ctx.bezierCurveTo(curve.c1.x, curve.c1.y, curve.c2.x, curve.c2.y, curve.p2.x, curve.p2.y);
        renderer.stroke();

        renderer.restore();
    }
}
