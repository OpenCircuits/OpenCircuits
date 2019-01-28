import {LEFT_MOUSE_BUTTON,
        OPTION_KEY,
        SHIFT_KEY} from "../Constants";
import {Tool} from "./Tool";
import {CircuitDesigner} from "../../models/CircuitDesigner";
import {IOObject} from "../../models/ioobjects/IOObject";
import {Component} from "../../models/ioobjects/Component";
import {PressableComponent} from "../../models/ioobjects/PressableComponent";

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

    // Current selection box positions
    private p1: Vector;
    private p2: Vector;

    public constructor(designer: CircuitDesigner, camera: Camera) {
        super();

        this.designer = designer;
        this.camera = camera;

        this.selections = [];
        this.selecting = false;
    }

    public onMouseDrag(input: Input, button: number): boolean {
        // Update positions of selection
        //  box and set selecting to true
        if (button === LEFT_MOUSE_BUTTON) {
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
            // Stop selection box
            if (this.selecting) {
                this.selecting = false;

                // Clear selections if no shift key
                if (!input.isKeyDown(SHIFT_KEY))
                    this.selections = [];

                // Calculate transform rectangle of the selection box
                var p1 = this.camera.getWorldPos(input.getMouseDownPos());
                var p2 = this.camera.getWorldPos(input.getMousePos());
                var box = new Transform(p1.add(p2).scale(0.5), p2.sub(p1).abs());

                // Go through each object and see if it's within
                //  the selection box
                var objects = this.designer.getObjects();
                for (let obj of objects) {
                    // Check if object is in box
                    if (TransformContains(box, obj.getTransform())) {
                        // Add to selections if not already selected
                        if (!this.selections.includes(obj))
                            this.selections.push(obj);
                    }
                }

                return true; // should render
            }
        }

        return false;
    }

    public onClick(input: Input, button: number): boolean {
        if (button === LEFT_MOUSE_BUTTON) {
            let worldMousePos = this.camera.getWorldPos(input.getMousePos());

            // Clear selections if no shift key
            if (!input.isKeyDown(SHIFT_KEY))
                this.selections = [];

            // Check if an object was clicked
            //  and add to selections
            let objects = this.designer.getObjects();
            for (let i = objects.length-1; i >= 0; i--) {
                let obj = objects[i];

                if (obj instanceof PressableComponent) {
                    // Make sure mouse is within selection box,
                    //  but not within regular transform
                    if (RectContains(obj.getSelectionBox(), worldMousePos) &&
                        !RectContains(obj.getTransform(), worldMousePos)) {
                        // Add to selections if not already selected
                        if (!this.selections.includes(obj))
                            this.selections.push(obj);
                    }
                } else {
                    // Check if mouse is within bounds of the object
                    if (RectContains(obj.getTransform(), worldMousePos)) {
                        // Add to selections if not already selected
                        if (!this.selections.includes(obj))
                            this.selections.push(obj);
                    }
                }
            }

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

}
