import {Margin} from "math/Rect";

import {Circuit} from "shared/api/circuit/public";

import {ToolHandler, ToolHandlerResponse} from "./ToolHandler";
import {Viewport} from "shared/api/circuitdesigner/public/Viewport";


const FIT_PADDING_RATIO = 1.2;

export function FitToScreen(circuit: Circuit, viewport: Viewport): void {
    viewport.zoomToFit(
        // Fit selections if there are any, otherwise fit entire circuit
        (circuit.selections.isEmpty
            ? circuit.getObjs().all
            : circuit.selections.all),
        FIT_PADDING_RATIO
    );
}

export const FitToScreenHandler: ToolHandler = {
    onEvent: (ev, { circuit, viewport }) => {
        // Activate when releasing F key
        if (!(ev.type === "keyup" && ev.key === "f"))
            return ToolHandlerResponse.PASS;

        FitToScreen(circuit, viewport);

        // This should be the only handler to execute
        return ToolHandlerResponse.HALT;
    },
}
