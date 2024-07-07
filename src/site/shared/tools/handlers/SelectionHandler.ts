import {LEFT_MOUSE_BUTTON}                from "shared/utils/input/Constants";
import {ToolHandler, ToolHandlerResponse} from "./ToolHandler";


export const SelectionHandler: ToolHandler = {
    onEvent: (ev, { circuit, viewport }) => {
        if (!(ev.type === "click" && ev.button === LEFT_MOUSE_BUTTON))
            return ToolHandlerResponse.PASS;

        const deselectAll = (!ev.input.isShiftKeyDown && circuit.selections.length > 0);

        const obj = circuit.pickObjAt(viewport.curCamera.toWorldPos(ev.input.mousePos));
        if (!obj) {
            // Clear selections if not holding shift
            if (deselectAll) {
                circuit.selections.clear();
                return ToolHandlerResponse.HALT;
            }
            return ToolHandlerResponse.PASS;
        }

        // TODO[model_refactor_api](leon) - think about how this works w/ ports and WireTool (like in master)

        const shouldSelect = (!ev.input.isShiftKeyDown || !obj.isSelected);

        circuit.beginTransaction();

        if (deselectAll)
            circuit.selections.clear();
        obj.isSelected = shouldSelect;

        circuit.commitTransaction();

        // This should be the only handler to handle the click event if we did something
        return ToolHandlerResponse.HALT;
    },
}
