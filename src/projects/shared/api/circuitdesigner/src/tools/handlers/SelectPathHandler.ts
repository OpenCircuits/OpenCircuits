import {LEFT_MOUSE_BUTTON}                from "shared/api/circuitdesigner/input/Constants";
import {ToolHandler, ToolHandlerResponse} from "./ToolHandler";
import {Component} from "shared/api/circuit/public";


/**
 * Gets all the components connected to this component
 *  Note: this path is UN-ORDERED!
 *
 * @param c The component to start from.
 * @returns The array of components in the same circuit (including c).
 */
export function GetComponentPath(c: Component): Component[] {
    const path: Component[] = [];

    // Breadth First Search
    const queue = new Array<Component>(c);
    const visited = new Set<string>();

    while (queue.length > 0) {
        const q = queue.shift()!;

        visited.add(q.id);
        path.push(q);
        for (const c of q.allPorts.flatMap((port) => port.connectedPorts).map((port) => port.parent)) {
            if (!visited.has(c.id))
                queue.push(c);
        }
    }

    return path;
}

export const SelectPathHandler: ToolHandler = {
    onEvent: (ev, { circuit, viewport }) => {
        // Activate on double LMB click
        if (!(ev.type === "dblclick" && ev.button === LEFT_MOUSE_BUTTON))
            return ToolHandlerResponse.PASS;

        // Make sure we double clicked on something
        const obj = circuit.pickObjAt(viewport.toWorldPos(ev.input.mousePos));
        if (!obj)
            return ToolHandlerResponse.PASS;

        const path = (() => {
            switch (obj.baseKind) {
                case "Component":
                    // For nodes, return the path of one of the ports (they are all on the same path by definition)
                    if (obj.isNode())
                        return obj.allPorts[0].path;
                    // For other components, return all of the components that are connected
                    // TODO: Get connected components
                    return GetComponentPath(obj);
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
        circuit.commitTransaction("Selected All Connected Components");

        // This should be the only handler to handle the click event if we did something
        return ToolHandlerResponse.HALT;
    },
}
