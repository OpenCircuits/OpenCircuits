import {CirclePrim}       from "core/internal/view/rendering/prims/CirclePrim";
import {CircleSectorPrim} from "core/internal/view/rendering/prims/CircleSectorPrim";

import {ROTATION_CIRCLE_RADIUS, ROTATION_CIRCLE_THICKNESS, RotateTool} from "../RotateTool";

import {ToolRenderer} from "./ToolRenderer";


export const RotateToolRenderer: ToolRenderer<RotateTool | undefined> = {
    isActive: (curTool): curTool is RotateTool | undefined => (!curTool || curTool instanceof RotateTool),

    render: ({ circuit, renderer, curTool }) => {
        const pos = circuit.selectionsMidpoint("world");

        const drawOutline = () => {
            renderer.draw(new CirclePrim(pos, ROTATION_CIRCLE_RADIUS, {
                stroke: {
                    color: "#ff0000",
                    size:  ROTATION_CIRCLE_THICKNESS,
                },
                alpha: 0.5,
            }));
        }

        const selections = circuit.selectedObjs;

        // If we are in the default tool, draw the rotation circle outline if we have only components selected
        if (!curTool) {
            if (selections.length > 0 &&
                selections.every((o) => (o.baseKind === "Component"))) {
                drawOutline();
            }
            return;
        }

        // Otherwise rotate tool is active so draw the rotation circle and outline
        drawOutline();

        const a0 = curTool.getStartAngle(), a1 = curTool.getPrevAngle();
        renderer.draw(new CircleSectorPrim(pos, ROTATION_CIRCLE_RADIUS, [a0, a1], {
            fill:  "#ffffff",
            alpha: 0.4,
        }));
    },
}
