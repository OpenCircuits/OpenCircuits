import {Input} from "./Input";
import {MouseListener} from "./MouseListener";

import {CircuitDesigner} from "../models/CircuitDesigner";

export class TransformController implements MouseListener {
    private designer: CircuitDesigner;
    private camera: Camera;

    private isDragging: boolean;
    private isRotating: boolean;

    public constructor(designer: CircuitDesigner, camera: Camera) {
        this.designer = designer;
        this.camera = camera;

        this.isDragging = false;
        this.isRotating = false;
    }

    public onMouseDown(input: Input, button: number): boolean {
        var objects = this.designer.getObjects();
        var worldMousePos = this.camera.getWorldPos(input.getMousePos());

        // Check if rotation circle was pressed
        if (!this.isRotating && selectionTool.selections.length > 0) {
            var d = worldMousePos.sub(selectionTool.midpoint).len2();
            if (d <= ROTATION_CIRCLE_R2 && d >= ROTATION_CIRCLE_R1) {
                return this.startRotation(selectionTool.selections, worldMousePos);
            }
        }

        // Go through objects backwards since objects on top are in the back
        for (var i = objects.length-1; i >= 0; i--) {
            var obj = objects[i];

            // Check if object's selection box was pressed
            if (obj.contains(worldMousePos) || obj.sContains(worldMousePos)) {
                pressedObj = obj;
                return;
            }
        }
    }

    public onMouseMove(input: Input, button: number): boolean {
        throw new Error("Method not implemented.");
    }

    public onMouseDrag(input: Input, button: number): boolean {
        throw new Error("Method not implemented.");
    }

    public onMouseUp(input: Input, button: number): boolean {
        throw new Error("Method not implemented.");
    }

    public onClick(input: Input, button: number): boolean {
        throw new Error("Method not implemented.");
    }



}
