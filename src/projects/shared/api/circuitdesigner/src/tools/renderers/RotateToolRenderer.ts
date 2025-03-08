import {isObjComponent} from "shared/api/circuit/public";

import {ROTATION_CIRCLE_RADIUS, ROTATION_CIRCLE_THICKNESS, RotateTool} from "../RotateTool";

import {ToolRenderer} from "./ToolRenderer";


export const RotateToolRenderer: ToolRenderer = {
    render: ({ designer: { circuit, curTool }, renderer }) => {
        const pos = circuit.selections.midpoint;

        const drawOutline = () => {
            renderer.draw({
                kind: "Circle",

                pos,
                radius: ROTATION_CIRCLE_RADIUS,

                style: {
                    stroke: {
                        color: "#ff0000",
                        size:  ROTATION_CIRCLE_THICKNESS,
                    },
                    alpha: 0.4,
                },
            });
        }

        const selections = circuit.selections;

        // If we are in the default tool, draw the rotation circle outline if we have only components selected
        if (!curTool) {
            if (!selections.isEmpty && selections.every((isObjComponent)))
                drawOutline();
            return;
        }

        // If a non-rotate-tool active, then do nothing
        if (!(curTool instanceof RotateTool))
            return;

        // Otherwise rotate tool is active so draw the rotation circle and outline
        drawOutline();

        const a0 = curTool.getStartAngle(), a1 = curTool.getPrevAngle();
        renderer.draw({
            kind: "CircleSector",

            pos,
            radius: ROTATION_CIRCLE_RADIUS,
            angles: [a0, a1],

            style: {
                fill:  "#ffffff",
                alpha: 0.4,
            },
        });
    },
}
