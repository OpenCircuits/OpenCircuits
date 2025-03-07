import {BezierCurve} from "math/BezierCurve";

import {WiringTool} from "../WiringTool";

import {ToolRenderer, ToolRendererArgs} from "./ToolRenderer";


export const WiringToolRenderer = (getColor: (params: ToolRendererArgs) => string | undefined): ToolRenderer => ({
    render: (args) => {
        const { designer: { curTool, viewport }, renderer } = args;

        // If a non-selection-box-tool active, then do nothing
        if (!(curTool instanceof WiringTool))
            return;

        const port = curTool.getCurPort();
        const target = curTool.getTargetPos();
        if (!port || !target)
            return;

        const targetPos = viewport.camera.toWorldPos(target);
        const curve = new BezierCurve(port.targetPos, targetPos, port.targetPos.add(port.dir.scale(1)), targetPos);
        renderer.draw({
            kind: "BezierCurve",

            curve,
            style: renderer.options.wireStyle(false, getColor(args)),
        });
    },
});
