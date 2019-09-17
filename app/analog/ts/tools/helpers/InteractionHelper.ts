import {BezierContains} from "math/MathUtils";
import {Camera} from "math/Camera";

import {EECircuitDesigner} from "analog/models/EECircuitDesigner";
import {EEObject} from "analog/models/eeobjects/EEObject";

import {Input} from "core/utils/Input";

export class InteractionHelper {
    private designer: EECircuitDesigner;
    private camera: Camera;

    private isPressingPressableObj: boolean;
    private currentlyPressedObj: EEObject;

    public constructor(designer: EECircuitDesigner, camera: Camera) {
        this.designer = designer;
        this.camera = camera;

        this.isPressingPressableObj = false;
        this.currentlyPressedObj = undefined;
    }

    public setCurrentlyPressedObj(obj: EEObject): void {
        this.currentlyPressedObj = obj;
    }

    public press(input: Input): boolean {
        const worldMousePos = this.camera.getWorldPos(input.getMousePos());
        const objects = this.designer.getObjects().reverse();

        this.isPressingPressableObj = false;

        // Check if we're pressing an object
        const pressedObj = objects.find((o) => o.isWithinPressBounds(worldMousePos));
        if (pressedObj) {
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
            this.currentlyPressedObj = undefined;
            return true;
        }
        this.currentlyPressedObj = undefined;

        return false;
    }

    public click(): boolean {
        return false;
    }

    public getCurrentlyPressedObj(): EEObject {
        return this.currentlyPressedObj;
    }
}
