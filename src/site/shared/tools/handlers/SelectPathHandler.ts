import {LEFT_MOUSE_BUTTON}                from "shared/utils/input/Constants";
import {ToolHandler, ToolHandlerResponse} from "./ToolHandler";


export const SelectPathHandler: ToolHandler = {
    onEvent: (ev, { circuit }) => {
        // Activate on double LMB click
        if (!(ev.type === "dblclick" && ev.button === LEFT_MOUSE_BUTTON))
            return ToolHandlerResponse.PASS;

        // Make sure we double clicked on something
        const obj = circuit.pickObjAt(ev.input.worldMousePos);
        if (!obj)
            return ToolHandlerResponse.PASS;

        const path = (() => {
            switch (obj.baseKind) {
                case "Component":
                    // For nodes, return the path of one of the ports (they are all on the same path by definition)
                    if (obj.isNode())
                        return obj.path;
                    // For other components, return all of the components that are connected
                    return [obj, ...obj.connectedComponents];
                case "Wire":
                    // For wires, return the path they are apart of
                    return obj.path;
                case "Port":
                    // For ports, return the path that the port is on
                    return obj.path;
            }
        })();

        circuit.beginTransaction();
        path.forEach((o) => o.select());
        circuit.commitTransaction();

        // This should be the only handler to handle the click event if we did something
        return ToolHandlerResponse.HALT;
    },
}
