import {LEFT_MOUSE_BUTTON}                from "shared/utils/input/Constants";
import {ToolHandler, ToolHandlerResponse} from "./ToolHandler";


export const SelectionHandler: ToolHandler = {
    onEvent: (ev, { circuit }) => {
        if (!(ev.type === "click" && ev.button === LEFT_MOUSE_BUTTON))
            return ToolHandlerResponse.PASS;

        const deselectAll = (!ev.state.isShiftKeyDown && circuit.selectedObjs.length > 0);

        const obj = circuit.pickObjAt(ev.state.mousePos, "screen");
        if (!obj) {
            // Clear selections if not holding shift
            if (deselectAll) {
                circuit.clearSelections();
                return ToolHandlerResponse.HALT;
            }
            return ToolHandlerResponse.PASS;
        }

        // TODO[model_refactor_api](leon) - think about how this works w/ ports and WireTool (like in master)

        const shouldSelect = (!ev.state.isShiftKeyDown || !obj.isSelected);

        circuit.beginTransaction();

        if (deselectAll)
            circuit.clearSelections();
        obj.isSelected = shouldSelect;

        circuit.commitTransaction();

        // This should be the only handler to handle the click event if we did something
        return ToolHandlerResponse.HALT;
    },
}
