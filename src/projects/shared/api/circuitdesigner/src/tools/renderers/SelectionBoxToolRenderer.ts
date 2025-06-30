import {Transform}     from "math/Transform";

import {SelectionBoxTool} from "../SelectionBoxTool";

import {ToolRenderer} from "./ToolRenderer";


export const SelectionBoxToolRenderer: ToolRenderer = {
    render: ({ designer: { curTool }, renderer }) => {
        // If a non-selection-box-tool active, then do nothing
        if (!(curTool instanceof SelectionBoxTool))
            return;

        const rect = curTool.getBounds();

        renderer.draw({
            kind: "Rectangle",

            transform: Transform.FromRect(rect),

            style: {
                stroke: {
                    color: "#6666ff",
                    size:  0.04,
                },
                fill:  "#ffffff",
                alpha: 0.4,
            },
        });
    },
}
