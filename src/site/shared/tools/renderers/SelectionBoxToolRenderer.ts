import {RectanglePrim} from "core/internal/view/rendering/prims/RectanglePrim";
import {Transform}     from "math/Transform";

import {SelectionBoxTool} from "../SelectionBoxTool";

import {ToolRenderer} from "./ToolRenderer";


export const SelectionBoxToolRenderer: ToolRenderer = {
    render: ({ renderer, curTool }) => {
        // If a non-selection-box-tool active, then do nothing
        if (!(curTool instanceof SelectionBoxTool))
            return;

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
