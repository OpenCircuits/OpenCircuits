import {Vector} from "Vector";
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

    private findObject(pos: Vector): IOObject {
        const objects = this.designer.getObjects().reverse();
        const wires = this.designer.getWires().reverse();

        const objs = (objects as IOObject[]).concat(wires);
        return objs.find(o => (isPressable(o) && o.isWithinPressBounds(pos)) || o.isWithinSelectBounds(pos));
    }

    private pressing(obj: IOObject, pos: Vector): obj is Pressable {
        return (isPressable(obj) && obj.isWithinPressBounds(pos));
    }

    public press(input: Input): boolean {
        const worldMousePos = this.camera.getWorldPos(input.getMousePos());

        // Find and press object
        const obj = this.findObject(worldMousePos);

        this.currentlyPressedObj = obj;
        if (this.pressing(obj, worldMousePos)) {
            obj.press();
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

        // Find and click object
        const obj = this.findObject(worldMousePos);
        if (this.pressing(obj, worldMousePos)) {
            obj.click();
            return true;
        }

        return false;
    }

    public getCurrentlyPressedObj(): Selectable {
        return this.currentlyPressedObj;
    }
}
