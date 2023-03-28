import {RectanglePrim} from "core/internal/view/rendering/prims/RectanglePrim";
import {Transform}     from "math/Transform";

import {SelectionBoxTool} from "../SelectionBoxTool";

import {ToolRenderer} from "./ToolRenderer";


export const SelectionBoxToolRenderer: ToolRenderer<SelectionBoxTool> = {
    isActive: (curTool): curTool is SelectionBoxTool => (curTool instanceof SelectionBoxTool),

    render: ({ renderer, curTool }) => {
        const rect = curTool.getBounds();

        renderer.draw(new RectanglePrim(Transform.FromRect(rect), {
            stroke: {
                color: "#6666ff",
                size:  0.04,
            },
            fill:  "#ffffff",
            alpha: 0.4,
        }));
    },
}
