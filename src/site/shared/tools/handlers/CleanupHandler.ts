import {SnapToGrid} from "shared/utils/SnapUtils";

import {ToolHandler, ToolHandlerResponse} from "./ToolHandler";


export const CleanupHandler: ToolHandler = {
    onEvent: (ev, { circuit }) => {
        // Activate when pressing K key
        if (!(ev.type === "keydown" && ev.key === "k"))
            return ToolHandlerResponse.PASS;

        // Get selected components if we have selections, or get all components to cleanup
        const comps = (circuit.selections.isEmpty
            ? circuit.findAll("Component").result
            : circuit.selections.components);

        if (comps.length === 0)
            return ToolHandlerResponse.PASS;

        // For now, this cleanup will:
        //  1. Reset all of the components' angles to the nearest 90 degrees (and normalized to be in [0, 2PI))
        //  2. Snap all of the components' positions to the nearest grid point
        circuit.beginTransaction();

        comps.forEach((comp) => {
            // Snap angle and normalize
            comp.angle = (Math.PI/2 * Math.round(comp.angle / (Math.PI/2))) % (2*Math.PI);

            // Snap position
            comp.pos = SnapToGrid(comp.pos);
        });

        circuit.commitTransaction();

        // This should be the only handler to execute
        return ToolHandlerResponse.HALT;
    },
}