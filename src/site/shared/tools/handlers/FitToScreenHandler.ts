import {Margin} from "math/Rect";

import {Circuit} from "core/public";

import {ToolHandler, ToolHandlerResponse} from "./ToolHandler";


const FIT_PADDING_RATIO = 1.2;

export function FitToScreen(circuit: Circuit, margin: Margin): void {
    circuit.camera.zoomToFit(
        // Fit selections if there are any, otherwise fit entire circuit
        (circuit.selections.isEmpty
            ? circuit.getObjs()
            : circuit.selections.all),
        margin,
        FIT_PADDING_RATIO
    );
}

export const FitToScreenHandler: ToolHandler = {
    onEvent: (ev, { circuit, margin }) => {
        // Activate when releasing F key
        if (!(ev.type === "keyup" && ev.key === "f"))
            return ToolHandlerResponse.PASS;

        FitToScreen(circuit, margin);

        // This should be the only handler to execute
        return ToolHandlerResponse.HALT;
    },
}
