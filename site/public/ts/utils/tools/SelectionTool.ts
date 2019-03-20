import {LEFT_MOUSE_BUTTON,
        OPTION_KEY, SHIFT_KEY,
        DELETE_KEY, BACKSPACE_KEY,
        ESC_KEY} from "../Constants";
import {Tool} from "./Tool";
import {CircuitDesigner} from "../../models/CircuitDesigner";
import {IOObject} from "../../models/ioobjects/IOObject";
import {Component} from "../../models/ioobjects/Component";
import {PressableComponent} from "../../models/ioobjects/PressableComponent";
import {PlaceComponentTool} from "./PlaceComponentTool"

import {Vector,V} from "../math/Vector";
import {Transform} from "../math/Transform";
import {TransformContains,RectContains} from "../math/MathUtils";

import {Input} from "../Input";
import {Camera} from "../Camera";

export class SelectionTool extends Tool {

    private designer: CircuitDesigner;
    private camera: Camera;

    private selections: Array<IOObject>;
    private selecting: boolean;

    // These functions are called every time the selections change
    // TODO: pass selections as argument
    private callbacks: Array<{ (): void }>;

    // Current selection box positions
    private p1: Vector;
    private p2: Vector;

    private currentPressedObj: IOObject;
    private pressedObj: boolean;

    private disabledSelections: boolean;

    public constructor(designer: CircuitDesigner, camera: Camera) {
        super();

        this.designer = designer;
        this.camera = camera;

        this.selections = [];
        this.selecting = false;

        this.disabledSelections = false;

        this.callbacks = [];
    }

    private selectionsChanged() {
        this.callbacks.forEach(c => c());
    }

    public addSelection(obj: IOObject): boolean {
        // Don't select anything if it's disabled
        if (this.disabledSelections)
            return false;

        if (!this.selections.includes(obj)) {
            this.selections.push(obj);
            this.selectionsChanged();
            return true;
        }
        return false;
    }

    public clearSelections(): boolean {
        if (this.selections.length == 0)
            return false;
        this.selections = [];
        this.selectionsChanged();
        return true;
    }

    public setCurrentlyPressedObj(obj: IOObject): void {
        this.currentPressedObj = obj;
    }

    public disableSelections(val: boolean = true) {
        this.disabledSelections = val;
    }

    public activate(currentTool: Tool, event: string, input: Input, button?: number): boolean {
        if (event == "mouseup")
            this.onMouseUp(input, button);
        if (event == "onclick" && !(currentTool instanceof PlaceComponentTool))
            this.onClick(input, button);
        return false;
    }

    public deactivate(event: string, input: Input, button?: number): boolean {
        this.selecting = false;

        return false;
    }

    public onMouseDown(input: Input, button: number): boolean {
        if (button === LEFT_MOUSE_BUTTON) {
            let worldMousePos = this.camera.getWorldPos(input.getMousePos());

            let objects = this.designer.getObjects();
            for (let i = objects.length-1; i >= 0; i--) {
                let obj = objects[i];

                // Check if we pressed the object
                if (obj.isWithinPressBounds(worldMousePos)) {
                    if (obj instanceof PressableComponent)
                        obj.press();
                    this.pressedObj = true;
                    this.currentPressedObj = obj;
                    return true;
                }
                // If just the selection box was hit then
                //  don't call the press() method, just set
                //  currentPressedObj to potentially drag
                else if (obj.isWithinSelectBounds(worldMousePos)) {
                    this.pressedObj = false;
                    this.currentPressedObj = obj;
                    return false;
                }
            }
        }
    }

    public onMouseDrag(input: Input, button: number): boolean {
        // Update positions of selection
        //  box and set selecting to true
        if (button === LEFT_MOUSE_BUTTON && !this.disabledSelections) {
            this.selecting = true;

            // Update selection box positions
            this.p1 = input.getMouseDownPos();
            this.p2 = input.getMousePos();

            return true; // should render
        }

        return false;
    }

    public onMouseUp(input: Input, button: number): boolean {
        // Find selections within the
        //  current selection box
        if (button === LEFT_MOUSE_BUTTON) {
            // Release currently pressed object
            if (this.pressedObj) {
                this.pressedObj = false;
                if (this.currentPressedObj instanceof PressableComponent)
                    this.currentPressedObj.release();
                this.currentPressedObj = undefined;
                return true;
            }
            this.currentPressedObj = undefined;

            // Stop selection box
            if (this.selecting) {
                this.selecting = false;

                // Clear selections if no shift key
                if (!input.isKeyDown(SHIFT_KEY))
                    this.clearSelections();

                // Calculate transform rectangle of the selection box
                let p1 = this.camera.getWorldPos(input.getMouseDownPos());
                let p2 = this.camera.getWorldPos(input.getMousePos());
                let box = new Transform(p1.add(p2).scale(0.5), p2.sub(p1).abs());

                // Go through each object and see if it's within
                //  the selection box
                let objects = this.designer.getObjects();
                for (let obj of objects) {
                    // Check if object is in box
                    if (TransformContains(box, obj.getTransform()))
                        this.addSelection(obj);
                }

                return true; // should render
            }
        }

        return false;
    }

    public onClick(input: Input, button: number): boolean {
        if (button === LEFT_MOUSE_BUTTON) {
            let worldMousePos = this.camera.getWorldPos(input.getMousePos());

            let render = false;

            // Clear selections if no shift key
            if (!input.isKeyDown(SHIFT_KEY))
                render = this.clearSelections();

            // Check if an object was clicked
            //  and add to selections
            let objects = this.designer.getObjects();
            for (let i = objects.length-1; i >= 0; i--) {
                let obj = objects[i];

                if (obj.isWithinPressBounds(worldMousePos)) {
                    // Check if object should be clicked
                    if (obj instanceof PressableComponent) {
                        obj.click();
                        return true;
                    }
                }
                // Check if object should be selected
                else if (obj.isWithinSelectBounds(worldMousePos)) {
                    return this.addSelection(obj);
                }
            }

            return render;
        }

        return false;
    }

    public onKeyDown(input: Input, key: number): boolean {
        if (this.selections.length == 0)
            return false;

        if (key == DELETE_KEY || key == BACKSPACE_KEY) {
            for (const selection of this.selections) {
                if (selection instanceof Component)
                    this.designer.removeObject(selection);
            }
            this.clearSelections();
            return true;
        }
        if (key == ESC_KEY) {
            this.clearSelections();
            return true;
        }

        return false;
    }

    public calculateMidpoint(): Vector {
        let selections = this.selections;
        let midpoint = V();
        for (let obj of selections) {
            if (obj instanceof Component)
                midpoint.translate(obj.getPos());
        }
        return midpoint.scale(1. / selections.length);
    }

    public getSelections(): Array<IOObject> {
        return this.selections.slice(); // shallow copy
    }
    public isSelecting(): boolean {
        return this.selecting;
    }

    public getP1(): Vector {
        return this.p1.copy();
    }
    public getP2(): Vector {
        return this.p2.copy();
    }

    public addSelectionChangeListener(func: {(): void}) {
        this.callbacks.push(func);
    }
    public getCurrentlyPressedObj(): IOObject {
        return this.currentPressedObj;
    }

}
