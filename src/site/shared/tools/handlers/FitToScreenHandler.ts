import {ToolHandler, ToolHandlerResponse} from "./ToolHandler";


const FIT_PADDING_RATIO = 1.2;

export const FitToScreenHandler: ToolHandler = {
    onEvent: (ev, { circuit }) => {
        // Activate when releasing F key
        if (!(ev.type === "keyup" && ev.key === "f"))
            return ToolHandlerResponse.PASS;

        circuit.camera.zoomToFit(
            // Fit selections if there are any, otherwise fit entire circuit
            circuit.selections.isEmpty
                ? circuit.getObjs()
                : circuit.selections.all);

        // This should be the only handler to execute
        return ToolHandlerResponse.HALT;
    },
}
