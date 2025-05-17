import {V, Vector} from "Vector";
import {Transform} from "math/Transform";
import {CircleContains, RectContains} from "math/MathUtils";

import {LEFT_MOUSE_BUTTON}                from "shared/api/circuitdesigner/input/Constants";
import {ToolHandler, ToolHandlerResponse} from "shared/api/circuitdesigner/tools/handlers/ToolHandler";

import {Signal}           from "digital/api/circuit/schema/Signal";
import {DigitalComponent} from "digital/api/circuit/public/DigitalComponent";
import {DigitalTypes}     from "digital/api/circuit/public/impl/DigitalCircuitState";


function isPressableComponent(obj: DigitalTypes["Obj"] | undefined): obj is DigitalComponent {
    return (!!obj && obj.kind === "Button");
}
function isClickableComponent(obj: DigitalTypes["Obj"] | undefined): obj is DigitalComponent {
    return (!!obj && obj.kind === "Switch");
}
function isWithinInteractableBounds(obj: DigitalComponent, pos: Vector): boolean {
    switch (obj.kind) {
    case "Button":
        return CircleContains(obj.pos, 0.45, pos);
    case "Switch":
        return RectContains(new Transform(obj.pos, obj.angle, V(0.96, 1.2)), pos);
    default:
        return false;
    }
}

export const InteractionHandler: ToolHandler<DigitalTypes> = {
    canActivateWhenLocked: true,

    onEvent: (ev, { circuit, viewport }) => {
        const pos = viewport.camera.toWorldPos(ev.input.mousePos);

        if (ev.type === "mousedown" && ev.button === LEFT_MOUSE_BUTTON) {
            const obj = circuit.pickObjAt(pos);
            if (isPressableComponent(obj) && isWithinInteractableBounds(obj, pos)) {
                obj.setSimState([Signal.On]);
                return ToolHandlerResponse.HALT;
            }
        }

        if (ev.type === "mouseup" && ev.button === LEFT_MOUSE_BUTTON) {
            const obj = circuit.pickObjAt(pos);
            if (isPressableComponent(obj) && isWithinInteractableBounds(obj, pos)) {
                obj.setSimState([Signal.Off]);
                return ToolHandlerResponse.HALT;
            }
        }

        if (ev.type === "click" && ev.button === LEFT_MOUSE_BUTTON) {
            const obj = circuit.pickObjAt(pos);
            if (isClickableComponent(obj) && isWithinInteractableBounds(obj, pos)) {
                obj.setSimState([Signal.invert(obj.outputs[0].signal)]);
                return ToolHandlerResponse.HALT;
            }
        }

        if (ev.type === "dblclick" && ev.button === LEFT_MOUSE_BUTTON) {
            const obj = circuit.pickObjAt(pos);

            // Halt select path handler
            if (obj?.baseKind === "Component" && isWithinInteractableBounds(obj, pos))
                return ToolHandlerResponse.HALT;
        }

        return ToolHandlerResponse.PASS;
    },
}
