
import {BezierContains} from "math/MathUtils";
import {Camera} from "math/Camera";

import {Input} from "core/utils/Input";
import {isPressable} from "core/utils/Pressable";
import {Selectable} from "core/utils/Selectable";

import {CircuitDesigner} from "core/models/CircuitDesigner";

export class InteractionHelper {
    private designer: CircuitDesigner;
    private camera: Camera;

    private isPressingPressableObj: boolean;
    private currentlyPressedObj: Selectable;

    public constructor(designer: CircuitDesigner, camera: Camera) {
        this.designer = designer;
        this.camera = camera;

        this.isPressingPressableObj = false;
        this.currentlyPressedObj = undefined;
    }

    public setCurrentlyPressedObj(obj: Selectable): void {
        this.currentlyPressedObj = obj;
    }

    public press(input: Input): boolean {
        const worldMousePos = this.camera.getWorldPos(input.getMousePos());
        const objects = this.designer.getObjects().reverse();

        this.isPressingPressableObj = false;

        // Check if we're pressing an object
        const pressedObj = objects.find((o) => o.isWithinPressBounds(worldMousePos));
        if (pressedObj) {
            if (isPressable(pressedObj))
                pressedObj.press();
            this.isPressingPressableObj = true;
            this.currentlyPressedObj = pressedObj;
            return true;
        }

        // Check if we're pressing an object within it's select bounds
        const selectedObj = objects.find((o) => o.isWithinSelectBounds(worldMousePos));
        if (selectedObj) {
            this.currentlyPressedObj = selectedObj;
            return false;
        }

        // Check if we're pressing a wire
        const w = this.designer.getWires().find((w) => BezierContains(w.getShape(), worldMousePos));
        if (w)
            this.currentlyPressedObj = w;

        return false;
    }

    public release(): boolean {
        // Release currently pressed object
        if (this.isPressingPressableObj) {
            this.isPressingPressableObj = false;
            if (isPressable(this.currentlyPressedObj))
                this.currentlyPressedObj.release();
            this.currentlyPressedObj = undefined;
            return true;
        }
        this.currentlyPressedObj = undefined;

        return false;
    }

    public click(input: Input): boolean {
        const worldMousePos = this.camera.getWorldPos(input.getMousePos());
        const objects = this.designer.getObjects().reverse();

        // Find clicked object
        const clickedObj = objects.filter(o => isPressable(o))
                .find((o) => o.isWithinPressBounds(worldMousePos));
        if (isPressable(clickedObj)) {
            clickedObj.click();
            return true;
        }

        return false;
    }

    public getCurrentlyPressedObj(): Selectable {
        return this.currentlyPressedObj;
    }
}
