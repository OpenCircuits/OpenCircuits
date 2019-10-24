
import {BezierContains} from "math/MathUtils";
import {Camera} from "math/Camera";

import {Input} from "core/utils/Input";
import {isPressable, Pressable} from "core/utils/Pressable";
import {Selectable} from "core/utils/Selectable";

import {CircuitDesigner} from "core/models/CircuitDesigner";
import {IOObject} from "core/models/IOObject";

export class InteractionHelper {
    private designer: CircuitDesigner;
    private camera: Camera;

    private currentlyPressedObj: Selectable;

    public constructor(designer: CircuitDesigner, camera: Camera) {
        this.designer = designer;
        this.camera = camera;

        this.currentlyPressedObj = undefined;
    }

    public setCurrentlyPressedObj(obj: Selectable): void {
        this.currentlyPressedObj = obj;
    }

    public press(input: Input): boolean {
        const worldMousePos = this.camera.getWorldPos(input.getMousePos());
        const objects = this.designer.getObjects().reverse();
        const wires = this.designer.getWires().reverse();

        const objs = (objects as IOObject[]).concat(wires);

        // Check if we're pressing a pressable object or regular object
        const o = objs.find(o => (isPressable(o) && o.isWithinPressBounds(worldMousePos)) ||
                                  o.isWithinSelectBounds(worldMousePos));
        this.currentlyPressedObj = o;
        if (isPressable(o)) {
            o.press();
            return true;
        }

        return false;
    }

    public release(): boolean {
        // Release currently pressed object
        const obj = this.currentlyPressedObj;
        this.currentlyPressedObj = undefined;

        if (isPressable(obj)) {
            obj.release();
            return true;
        }

        return false;
    }

    public click(input: Input): boolean {
        const worldMousePos = this.camera.getWorldPos(input.getMousePos());
        const objects = this.designer.getObjects().reverse();

        // Find clicked object
        const obj = objects.find((o) => isPressable(o) && o.isWithinPressBounds(worldMousePos)) as Pressable;
        if (obj) {
            obj.click();
            return true;
        }

        return false;
    }

    public getCurrentlyPressedObj(): Selectable {
        return this.currentlyPressedObj;
    }
}
