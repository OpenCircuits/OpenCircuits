import {BezierCurve} from "math/BezierCurve";

import {Tool}       from "../Tool";
import {WiringTool} from "../WiringTool";

import {ToolRenderer, ToolRendererProps} from "./ToolRenderer";


/**
 * WiringToolRenderer is a class since Wire colors need to be specified
 *  as they change per-project.
 */
export class WiringToolRenderer implements ToolRenderer<WiringTool> {

    public isActive(curTool?: Tool): curTool is WiringTool {
        return (curTool instanceof WiringTool);
    }

    protected getColor({ options }: ToolRendererProps<WiringTool>): string | undefined {
        return options.defaultWireColor;
    }

    public render(props: ToolRendererProps<WiringTool>) {
        const { renderer, options, circuit, curTool, input } = props;

        const port = curTool.getCurPort();
        if (!port)
            return;

        const mousePos = circuit.camera.toWorldPos(input.mousePos);
        const curve = new BezierCurve(port.targetPos, mousePos, port.targetPos.add(port.dir.scale(1)), mousePos);

        renderer.save();

        renderer.setStyle(options.wireStyle(false, this.getColor(props)));

        renderer.beginPath();
        renderer.moveTo(curve.p1)
        renderer.ctx.bezierCurveTo(curve.c1.x, curve.c1.y, curve.c2.x, curve.c2.y, curve.p2.x, curve.p2.y);
        renderer.stroke();

        renderer.restore();
    }
}
