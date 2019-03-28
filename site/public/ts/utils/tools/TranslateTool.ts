import {GRID_SIZE, LEFT_MOUSE_BUTTON} from "../Constants";

import {Vector,V} from "../math/Vector";
import {Input} from "../Input";
import {Camera} from "../Camera";
import {Tool} from "./Tool";

import {SelectionTool} from "./SelectionTool";

import {Component} from "../../models/ioobjects/Component";

import {Action} from "../actions/Action";
import {TranslateAction} from "../actions/TranslateAction";

export class TranslateTool extends Tool {
    protected camera: Camera;

    protected pressedComponent: Component;
    protected components: Array<Component>;
    protected initialPositions: Array<Vector>;

    protected startPos: Vector;

    public constructor(camera: Camera) {
        super();

        this.camera = camera;
    }

    public activate(currentTool: Tool, event: string, input: Input, button?: number): boolean {
        if (!(currentTool instanceof SelectionTool))
            return false;
        if (!(event == "mousedrag"))
            return false;

        let worldMousePos = this.camera.getWorldPos(input.getMousePos());

        let selections = currentTool.getSelections();
        let currentPressedObj = currentTool.getCurrentlyPressedObj();

        // Make sure everything is a component
        if (!(currentPressedObj instanceof Component))
            return false;
        if (!selections.every((e) => e instanceof Component))
            return false;

        // Translate multiple objects if they are all selected
        this.pressedComponent = currentPressedObj;
        this.components = [currentPressedObj];
        if (selections.length > 0 && selections.includes(currentPressedObj))
            this.components = <Array<Component>>selections;

        // Copy initial positions
        this.initialPositions = [];
        for (let obj of this.components)
            this.initialPositions.push(obj.getPos());

        this.startPos = worldMousePos.sub(currentPressedObj.getPos());

        return true;
    }

    public deactivate(event: string, input: Input, button?: number): boolean {
        return (event == "mouseup");
    }

    public onMouseDrag(input: Input, button: number): boolean {
        if (button !== LEFT_MOUSE_BUTTON)
            return false;

        // Calculate position
        const worldMousePos = this.camera.getWorldPos(input.getMousePos());
        const dPos = worldMousePos.sub(this.pressedComponent.getPos()).sub(this.startPos);

        // Set positions
        for (let obj of this.components) {
            let newPos = obj.getPos().add(dPos);
            if (input.isShiftKeyDown()) {
                newPos = V(Math.floor(newPos.x/GRID_SIZE + 0.5) * GRID_SIZE,
                           Math.floor(newPos.y/GRID_SIZE + 0.5) * GRID_SIZE);
            }
            obj.setPos(newPos);
        }

        return true;
    }

    public getAction(): Action {
        // Copy final positions
        const finalPositions = [];
        for (let obj of this.components)
            finalPositions.push(obj.getPos());

        // Return action
        return new TranslateAction(this.components, this.initialPositions, finalPositions);
    }

}
