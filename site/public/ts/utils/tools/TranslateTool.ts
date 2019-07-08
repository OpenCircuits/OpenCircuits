import {GRID_SIZE,
        LEFT_MOUSE_BUTTON,
        SPACEBAR_KEY} from "../Constants";

import {CopyGroup} from "../ComponentUtils";

import {Vector,V} from "../math/Vector";
import {Input} from "../Input";
import {Camera} from "../Camera";
import {Tool} from "./Tool";

import {SelectionTool} from "./SelectionTool";

import {CircuitDesigner} from "../../models/CircuitDesigner";
import {Component} from "../../models/ioobjects/Component";
import {Wire} from "../../models/ioobjects/Wire";
import {WirePort} from "../../models/ioobjects/other/WirePort";

import {Action} from "../actions/Action";
import {GroupAction} from "../actions/GroupAction";
import {CopyGroupAction} from "../actions/CopyGroupAction";
import {TranslateAction} from "../actions/transform/TranslateAction";

import {MoveAndSnap} from "./helpers/SnapUtils";

export class TranslateTool extends Tool {
    protected designer: CircuitDesigner;
    protected camera: Camera;

    protected pressedComponent: Component;
    protected components: Array<Component>;
    protected initialPositions: Array<Vector>;
    protected neighbors: Map<Component, Array<Wire>>;

    private action: GroupAction;
    private startPos: Vector;

    public constructor(designer: CircuitDesigner, camera: Camera) {
        super();

        this.designer = designer;
        this.camera = camera;
        this.neighbors = new Map<Component, Array<Wire>>();
    }

    private calculateNeighbors(): void {
        this.neighbors.clear();
        for (const obj of this.components) {
            obj.getInputs().forEach(i => {
                const c = i.getInputComponent();
                const arr = this.neighbors.get(c) || [];
                arr.push(i);
                this.neighbors.set(c, arr);
            });
            obj.getOutputs().forEach(o => {
                const c = o.getOutputComponent();
                const arr = this.neighbors.get(c) || [];
                arr.push(o);
                this.neighbors.set(c, arr);
            });
        }
    }

    public activate(currentTool: Tool, event: string, input: Input, _?: number): boolean {
        if (!(currentTool instanceof SelectionTool))
            return false;
        if (!(event == "mousedrag"))
            return false;

        const worldMousePos = this.camera.getWorldPos(input.getMousePos());

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

        // Precalculate neighbor wires for each component
        // Used online to un-straighten wires when one component is dragged away from the other
        this.calculateNeighbors();

        // Copy initial positions
        this.initialPositions = this.components.map((o) => o.getPos());
        this.startPos = worldMousePos.sub(currentPressedObj.getPos());

        this.action = new GroupAction();

        return true;
    }

    public deactivate(event: string, _: Input): boolean {
        return (event == "mouseup");
    }

    public onMouseDrag(input: Input, button: number): boolean {
        if (button !== LEFT_MOUSE_BUTTON)
            return false;

        // Calculate position
        const worldMousePos = this.camera.getWorldPos(input.getMousePos());
        const dPos = worldMousePos.sub(this.pressedComponent.getPos()).sub(this.startPos);

        // Move and snap if it's a WirePort
        if (this.components.length == 1 && this.pressedComponent instanceof WirePort) {
            MoveAndSnap(this.pressedComponent, dPos);
            return true;
        }

        // Set positions of each component in turn
        for (const obj of this.components) {
            let newPos = obj.getPos().add(dPos);
            if (input.isShiftKeyDown()) {
                newPos = V(Math.floor(newPos.x/GRID_SIZE + 0.5) * GRID_SIZE,
                           Math.floor(newPos.y/GRID_SIZE + 0.5) * GRID_SIZE);
            }
            obj.setPos(newPos);
        }

        // If a wire connects a selected component with an unselected component, make it curvy
        for (const neighbor of this.neighbors) {
            if (this.components.indexOf(neighbor[0]) != -1)
                continue;
            neighbor[1].forEach(w => w.setIsStraight(false));
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
        // Copy final positions
        const finalPositions = [];
        for (const obj of this.components)
            finalPositions.push(obj.getPos());
        this.action.add(new TranslateAction(this.components, this.initialPositions, finalPositions));

        // Return action
        return this.action;
    }

}
