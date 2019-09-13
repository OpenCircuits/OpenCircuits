import {ROTATION_CIRCLE_R1,
        ROTATION_CIRCLE_R2,
        LEFT_MOUSE_BUTTON} from "../Constants";

import {Vector} from "../math/Vector";
import {Input} from "../Input";
import {Camera} from "../Camera";
import {Tool} from "./Tool";
import {SelectionTool} from "./SelectionTool";

import {Component} from "../../models/ioobjects/Component";

import {RotateAction} from "../actions/transform/RotateAction";

export class RotateTool extends Tool {
    private camera: Camera;

    private components: Array<Component>;
    private initialAngles: Array<number>;
    private currentAngles: Array<number>;

    private midpoint: Vector;

    private startAngle: number;
    private prevAngle: number;

    public constructor(camera: Camera) {
        super();

        this.camera = camera;
    }

    public activate(currentTool: Tool, event: string, input: Input): boolean {
        if (!(currentTool instanceof SelectionTool))
            return false;
        if (!(event == "mousedown"))
            return false;
        if (!(input.getTouchCount() == 1))
            return false;

        const selections = currentTool.getSelections();
        if (selections.length == 0)
            return false;

        // Make sure everything is a component
        if (!selections.every((e) => e instanceof Component))
            return false;

        const worldMousePos = this.camera.getWorldPos(input.getMousePos());

        // Check if mouse clicked on rotation circle
        const midpoint = currentTool.calculateMidpoint();
        const d = worldMousePos.sub(midpoint).len2();
        if (d <= ROTATION_CIRCLE_R2 && d >= ROTATION_CIRCLE_R1) {
            this.components = <Array<Component>>selections;

            // Copy initial angles
            this.initialAngles = [];
            this.currentAngles = [];
            for (const obj of this.components) {
                this.initialAngles.push(obj.getAngle());
                this.currentAngles.push(obj.getAngle());
            }

            this.midpoint = midpoint;
            this.startAngle = worldMousePos.sub(midpoint).angle();
            this.prevAngle = this.startAngle;

            return true;
        }
        return false;
    }

    public deactivate(event: string, _: Input): boolean {
        return (event == "mouseup");
    }

    public onMouseDrag(input: Input, button: number): boolean {
        if (button !== LEFT_MOUSE_BUTTON)
            return false;

        // Calculate angle
        const worldMousePos = this.camera.getWorldPos(input.getMousePos());
        const dAngle = worldMousePos.sub(this.midpoint).angle() - this.prevAngle;

        for (let i = 0; i < this.components.length; i++) {
            const obj = this.components[i];

            // Calculate new angle and store it before snapping
            let newAngle = this.currentAngles[i] + dAngle;

            // Store the un-snapped angle so that it snaps after
            //  a certain threshold
            this.currentAngles[i] = newAngle;

            // Snap to grid if shift is held
            if (input.isShiftKeyDown())
                newAngle = Math.floor(newAngle/(Math.PI/4))*Math.PI/4;

            // Set rotation
            obj.setRotationAbout(newAngle, this.midpoint);
        }
        this.prevAngle += dAngle;

        return true;
    }

    public getAction(): RotateAction {
        // Copy final positions
        const finalAngles = [];
        for (const obj of this.components)
            finalAngles.push(obj.getAngle());

        // Return action
        return new RotateAction(this.components, this.midpoint, this.initialAngles, finalAngles);
    }

    public getMidpoint(): Vector {
        return this.midpoint;
    }

    public getStartAngle(): number {
        return this.startAngle;
    }

    public getPrevAngle(): number {
        return this.prevAngle;
    }

}
