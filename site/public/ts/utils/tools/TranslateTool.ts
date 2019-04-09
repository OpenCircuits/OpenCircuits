import {GRID_SIZE,
        ROTATION_CIRCLE_R1,
        ROTATION_CIRCLE_R2,
        SHIFT_KEY,
        LEFT_MOUSE_BUTTON,
        SPACEBAR_KEY,
        WIRE_SNAP_THRESHOLD} from "../Constants";

import {CopyGroup} from "../ComponentUtils";

import {Vector,V} from "../math/Vector";
import {Input} from "../Input";
import {Camera} from "../Camera";
import {Tool} from "./Tool";

import {SelectionTool} from "./SelectionTool";

import {CircuitDesigner} from "../../models/CircuitDesigner";
import {IOObject} from "../../models/ioobjects/IOObject";
import {Wire} from "../../models/ioobjects/Wire";
import {Component} from "../../models/ioobjects/Component";
import {WirePort} from "../../models/ioobjects/other/WirePort";

import {Action} from "../actions/Action";
import {GroupAction} from "../actions/GroupAction";
import {CopyGroupAction} from "../actions/CopyGroupAction";
import {TranslateAction} from "../actions/TranslateAction";

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

        // Precalculate neighbor wires for each component
        // Used online to un-straighten wires when one component is dragged away from the other
        this.neighbors.clear();
        for (let obj of this.components) {
            obj.getInputs().forEach(i => {
                const c = i.getInputComponent();
                let arr = this.neighbors.get(c);
                arr = arr == undefined ? [] : arr;
                arr.push(i);
                this.neighbors.set(c, arr);
            });
            obj.getOutputs().forEach(o => {
                const c = o.getOutputComponent();
                let arr = this.neighbors.get(c);
                arr = arr == undefined ? [] : arr;
                arr.push(o);
                this.neighbors.set(c, arr);
            });
        }

        // Copy initial positions
        this.initialPositions = [];
        for (let obj of this.components)
            this.initialPositions.push(obj.getPos());

        this.startPos = worldMousePos.sub(currentPressedObj.getPos());

        this.action = new GroupAction();

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

        if (this.components.length == 1 && this.pressedComponent instanceof WirePort) {
            // Snap wire port to the grid lines of its neighbor ports (if it is close enough)
            const portPos = this.pressedComponent.getPos();
            let newPos = portPos.add(dPos);

            // getInputs() and getOutputs() have 1 and only 1 element each because WirePorts are specialized
            const prevPos = this.pressedComponent.getInputs()[0].getInput().getWorldTargetPos();
            const nextPos = this.pressedComponent.getOutputs()[0].getOutput().getWorldTargetPos();

            this.pressedComponent.getInputs()[0].setIsStraight(false);
            this.pressedComponent.getOutputs()[0].setIsStraight(false);

            if (Math.abs(newPos.x - prevPos.x) <= WIRE_SNAP_THRESHOLD) {
                newPos.x = prevPos.x;
                this.pressedComponent.getInputs()[0].setIsStraight(true);
            } else if (Math.abs(newPos.x - nextPos.x) <= WIRE_SNAP_THRESHOLD) {
                newPos.x = nextPos.x;
                this.pressedComponent.getOutputs()[0].setIsStraight(true);
            }

            if (Math.abs(newPos.y - prevPos.y) <= WIRE_SNAP_THRESHOLD) {
                newPos.y = prevPos.y;
                this.pressedComponent.getInputs()[0].setIsStraight(true);
            } else if (Math.abs(newPos.y - nextPos.y) <= WIRE_SNAP_THRESHOLD) {
                newPos.y = nextPos.y;
                this.pressedComponent.getOutputs()[0].setIsStraight(true);
            }

            // Only one position to set (the wire port)
            this.pressedComponent.setPos(newPos);
        }
        else {
            // Set positions of each component in turn
            for (let obj of this.components) {
                let newPos = obj.getPos().add(dPos);
                if (input.isShiftKeyDown()) {
                    newPos = V(Math.floor(newPos.x/GRID_SIZE + 0.5) * GRID_SIZE,
                            Math.floor(newPos.y/GRID_SIZE + 0.5) * GRID_SIZE);
                }
                obj.setPos(newPos);
            }

            // If a wire connects a selected component with an unselected component, make it curvy
            for (let neighbor of this.neighbors) {
                if (this.components.indexOf(neighbor[0]) == -1) {
                    neighbor[1].forEach(w => w.setIsStraight(false));
                }
            }
        }

        return true;
    }

    public onKeyUp(input: Input, key: number): boolean {
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
        for (let obj of this.components)
            finalPositions.push(obj.getPos());
        this.action.add(new TranslateAction(this.components, this.initialPositions, finalPositions));

        // Return action
        return this.action;
    }

}
