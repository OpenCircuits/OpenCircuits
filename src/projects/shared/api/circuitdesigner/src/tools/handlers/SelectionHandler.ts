import {LEFT_MOUSE_BUTTON}                from "shared/api/circuitdesigner/input/Constants";
import {ToolHandler, ToolHandlerResponse} from "./ToolHandler";


export const SelectionHandler: ToolHandler = {
    onEvent: (ev, { circuit, viewport }) => {
        if (!(ev.type === "click" && ev.button === LEFT_MOUSE_BUTTON))
            return ToolHandlerResponse.PASS;

        const deselectAll = (!ev.input.isShiftKeyDown && circuit.selections.length > 0);

        const obj = circuit.pickObjAt(viewport.toWorldPos(ev.input.mousePos));
        if (!obj) {
            // Clear selections if not holding shift
            if (deselectAll) {
                circuit.selections.clear();
                return ToolHandlerResponse.HALT;
            }
            return ToolHandlerResponse.PASS;
        }

        const shouldSelect = (!ev.input.isShiftKeyDown || !obj.isSelected);

        circuit.beginTransaction();

        if (deselectAll)
            circuit.selections.clear();
        obj.isSelected = shouldSelect;
        if (obj.baseKind === "Component" || obj.baseKind === "Wire")
            obj.shift();

        circuit.commitTransaction("Selected Object");

        // This should be the only handler to handle the click event if we did something
        return ToolHandlerResponse.HALT;
    },
}
