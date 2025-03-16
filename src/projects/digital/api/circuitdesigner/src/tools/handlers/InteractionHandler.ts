import {Signal} from "digital/api/circuit/internal/sim/Signal";
import {DigitalComponent} from "digital/api/circuit/public/DigitalComponent";
import {DigitalTypes} from "digital/api/circuit/public/impl/DigitalCircuitState";
import {LEFT_MOUSE_BUTTON}                from "shared/api/circuitdesigner/input/Constants";
import {ToolHandler, ToolHandlerResponse} from "shared/api/circuitdesigner/tools/handlers/ToolHandler";


function isPressableComponent(obj: DigitalTypes["Obj"] | undefined): obj is DigitalComponent {
    return (!!obj && obj.kind === "Button");
}
function isClickableComponent(obj: DigitalTypes["Obj"] | undefined): obj is DigitalComponent {
    return (!!obj && obj.kind === "Switch");
}

export const InteractionHandler: ToolHandler<DigitalTypes> = {
    onEvent: (ev, { circuit, viewport }) => {
        // TODO: Check a smaller area "pressable bounds"
        if (ev.type === "mousedown" && ev.button === LEFT_MOUSE_BUTTON) {
            const obj = circuit.pickObjAt(viewport.camera.toWorldPos(ev.input.mousePos));
            if (isPressableComponent(obj)) {
                obj.setSimState([Signal.On]);
                return ToolHandlerResponse.HALT;
            }
        }

        if (ev.type === "mouseup" && ev.button === LEFT_MOUSE_BUTTON) {
            const obj = circuit.pickObjAt(viewport.camera.toWorldPos(ev.input.mousePos));
            if (isPressableComponent(obj)) {
                obj.setSimState([Signal.Off]);
                return ToolHandlerResponse.HALT;
            }
        }

        if (ev.type === "click" && ev.button === LEFT_MOUSE_BUTTON) {
            const obj = circuit.pickObjAt(viewport.camera.toWorldPos(ev.input.mousePos));
            if (isClickableComponent(obj)) {
                obj.setSimState([Signal.invert(obj.outputs[0].signal)]);
                return ToolHandlerResponse.HALT;
            }
        }

        return ToolHandlerResponse.PASS;
    },
}
