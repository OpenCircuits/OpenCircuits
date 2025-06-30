import {V, Vector} from "Vector";
import {BezierCurve} from "math/BezierCurve";

import {RenderHelper} from "shared/api/circuitdesigner/public/Viewport";

import {WiringTool} from "../WiringTool";

import {ToolRenderer, ToolRendererArgs} from "./ToolRenderer";


function DrawX(renderer: RenderHelper, pos: Vector, len: number, col: string, strokeW: number) {
    renderer.draw({
        kind:  "Line",
        p1:    pos.add(V(-len/2, -len/2)),
        p2:    pos.add(V(len/2, len/2)),
        style: { stroke: { color: col, size: strokeW } },
    }, "screen");
    renderer.draw({
        kind:  "Line",
        p1:    pos.add(V(-len/2, len/2)),
        p2:    pos.add(V(len/2, -len/2)),
        style: { stroke: { color: col, size: strokeW } },
    }, "screen");
}

function DrawCheck(renderer: RenderHelper, pos: Vector, len: number, shortSideRatio: number, col: string, strokeW: number) {
    renderer.draw({
        kind:  "Line",
        p1:    pos,
        p2:    pos.add(len, -len),
        style: { stroke: { color: col, size: strokeW, lineCap: "square" } },
    }, "screen");
    renderer.draw({
        kind:  "Line",
        p1:    pos,
        p2:    pos.add(-len*shortSideRatio, -len*shortSideRatio),
        style: { stroke: { color: col, size: strokeW, lineCap: "square" } },
    }, "screen");
}


export const WiringToolRenderer = (getColor: (params: ToolRendererArgs) => string | undefined): ToolRenderer => ({
    render: (args) => {
        const { designer: { curTool, circuit, viewport }, renderer } = args;

        // If a non-selection-box-tool active, then do nothing
        if (!(curTool instanceof WiringTool))
            return;

        const port = curTool.getCurPort();
        const target = curTool.getTargetPos();
        if (!port || !target)
            return;

        const curve = new BezierCurve(port.targetPos, target, port.targetPos.add(port.dir.scale(1)), target);
        renderer.draw({
            kind: "BezierCurve",

            curve,
            style: renderer.options.wireStyle(false, getColor(args)),
        });

        // Draw indication that we're hovering on a target port
        const targetPotentialPort = curTool.findPort(target, circuit) ?? circuit.pickPortAt(target);
        if (!targetPotentialPort)
            return;
        const targetCanConnectPort = curTool.findPort(target, circuit, port);

        const EXTRA_RADIUS = 0.025;

        const radius = renderer.options.defaultPortRadius;
        const pos = (targetCanConnectPort ?? targetPotentialPort).targetPos;

        // Draw the port but bigger and with a red/green outline
        renderer.draw({
            kind:   "Circle",
            pos,
            radius: radius + EXTRA_RADIUS,
            style:  {
                fill:   renderer.options.defaultFillColor,
                stroke: {
                    size:  renderer.options.portLineWidth,
                    color: (targetCanConnectPort ? renderer.options.selectedFillColor
                                                 : renderer.options.defaultInvalidColor),
                },
            },
        });

        const OFFSET = V(12, 0), LEN = 7.5;

        // Also draw checkmark or 'x' next to the cursor
        const pos2 = viewport.toScreenPos(target).add(OFFSET);
        if (targetCanConnectPort) {
            const POS_OFFSET = V(-1, 1), STROKE_WIDTH = 3;

            // Draw a darker check underneath to make the bright green be a bit more visible
            DrawCheck(renderer, pos2.add(POS_OFFSET), LEN*0.8, 1/2,
                      "#000000", STROKE_WIDTH);
            DrawCheck(renderer, pos2.add(POS_OFFSET), LEN*0.8, 1/2,
                      renderer.options.selectedFillColor, STROKE_WIDTH);
        } else {
            const STROKE_WIDTH = 2;

            DrawX(renderer, pos2, LEN,
                  renderer.options.defaultInvalidColor, STROKE_WIDTH);
        }
    },
});
