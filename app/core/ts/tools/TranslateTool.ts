import {GRID_SIZE,
        LEFT_MOUSE_BUTTON,
        SPACEBAR_KEY} from "digital/utils/Constants";

import {CopyGroup} from "digital/utils/ComponentUtils";

import {Vector,V} from "Vector";
import {Camera} from "math/Camera";
import {Input} from "core/utils/Input";
import {Tool} from "core/tools/Tool";

import {SelectionTool} from "core/tools/SelectionTool";

import {CircuitDesigner} from "core/models/CircuitDesigner";
import {Component} from "core/models/Component";

import {Action} from "core/actions/Action";
import {GroupAction} from "core/actions/GroupAction";
import {CopyGroupAction} from "core/actions/CopyGroupAction";
import {TranslateAction} from "core/actions/transform/TranslateAction";
import {CreateGroupPostTranslateAction} from "core/actions/transform/GroupPostTranslateActionFactory";

export class TranslateTool extends Tool {
    protected designer: CircuitDesigner;
    protected camera: Camera;

    protected pressedComponent: Component;
    protected components: Array<Component>;
    protected initialPositions: Array<Vector>;

    private action: GroupAction;
    private startPos: Vector;

    public constructor(designer: CircuitDesigner, camera: Camera) {
        super(); 

        this.designer = designer;
        this.camera = camera;
    }

    public activate(currentTool: Tool, event: string, input: Input, _?: number): boolean {
        if (!(currentTool instanceof SelectionTool))
            return false;
        if (!(event == "mousedrag"))
            return false;

        const selections = currentTool.getSelections();
        const currentPressedObj = currentTool.getCurrentlyPressedObj();

        // Make sure everything is a component
        if (!(currentPressedObj instanceof Component))
            return false;
        if (!selections.every((e) => e instanceof Component))
            return false;

        // Translate multiple objects if they are all selected
        this.pressedComponent = currentPressedObj;
        this.components = [currentPressedObj];
        if (selections.includes(currentPressedObj))
            this.components = selections as Array<Component>;

        // Copy initial positions
        this.initialPositions = this.components.map((o) => o.getPos());

        this.action = new GroupAction();

        // Explicitly drag
        this.onMouseDrag(input, 0);

        return true;
    }

    public deactivate(event: string, _: Input): boolean {
        return (event == "mouseup");
    }

    public onMouseDrag(input: Input, button: number): boolean {
        if (button !== LEFT_MOUSE_BUTTON)
            return false;

        const dPos = this.camera.getWorldPos(input.getMousePos()).sub(
            this.camera.getWorldPos(input.getMouseDownPos()));

        for (let i = 0; i < this.components.length; i++) {
            let newPos = this.initialPositions[i].add(dPos);
            if (input.isShiftKeyDown()) {
                newPos = V(Math.floor(newPos.x/GRID_SIZE + 0.5) * GRID_SIZE,
                           Math.floor(newPos.y/GRID_SIZE + 0.5) * GRID_SIZE);
            }
            // Don't add action since we can have one action at the end
            new TranslateAction(this.components[i], newPos).execute();
        }

        return true;
    }

    public onKeyUp(_: Input, key: number): boolean {
        // Duplicate group when we press the spacebar
        if (key == SPACEBAR_KEY) {
            const group = CopyGroup(this.components);
            this.action.add(new CopyGroupAction(this.designer, this.components, group));
            this.designer.addGroup(group);

            return true;
        }
        return false;
    }

    public getAction(): Action {
        this.action.add(CreateGroupPostTranslateAction(this.components, this.initialPositions).execute());

        // Return action
        return this.action;
    }

}
