import {ROTATION_CIRCLE_R1,
        ROTATION_CIRCLE_R2,
        LEFT_MOUSE_BUTTON} from "core/utils/Constants";

import {Vector} from "Vector";
import {Camera} from "math/Camera";
import {Input} from "core/utils/Input";
import {Tool} from "core/tools/Tool";
import {SelectionTool} from "core/tools/SelectionTool";

import {Component} from "core/models/Component";

import {Action} from "core/actions/Action";
import {RotateAction} from "core/actions/transform/RotateAction";

export class RotateTool extends Tool {
    private camera: Camera;

    private components: Component[];
    private initialAngles: number[];
    private currentAngles: number[];

    private midpoint: Vector;

    private startAngle: number;
    private prevAngle: number;

    public constructor(camera: Camera) {
        super();

        this.camera = camera;
    }

    public shouldActivate(currentTool: Tool, event: string, input: Input): boolean {
        if (!(currentTool instanceof SelectionTool))
            return false;
        if (!(event == "mousedown" && input.getTouchCount() == 1))
            return false;
        const selections = currentTool.getSelections();
        if (selections.length == 0)
            return false;

        // Make sure selections are all components
        if (selections.some((s) => !(s instanceof Component)))
            return false;

        // Make sure the mouse is on the rotation circle
        const worldMousePos = this.camera.getWorldPos(input.getMousePos());
        const d = worldMousePos.sub(currentTool.calculateMidpoint()).len2();
        return (ROTATION_CIRCLE_R1 <= d && d <= ROTATION_CIRCLE_R2);
    }

    public activate(currentTool: Tool, event: string, input: Input): void {
        if (!(currentTool instanceof SelectionTool))
            throw new Error("Tool not selection tool!");

        const selections = currentTool.getSelections() as Component[];
        const midpoint = currentTool.calculateMidpoint();
        const worldMousePos = this.camera.getWorldPos(input.getMousePos());

        this.components = selections;

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
    }

    public shouldDeactivate(event: string, _: Input): boolean {
        return (event == "mouseup");
    }

    public deactivate(): Action {
        const finalAngles = this.components.map((c) => c.getAngle());

        return new RotateAction(this.components, this.midpoint, this.initialAngles, finalAngles);
    }

    public onMouseDrag(input: Input, button: number): boolean {
        if (button !== LEFT_MOUSE_BUTTON)
            return false;

        // Calculate angle
        const worldMousePos = this.camera.getWorldPos(input.getMousePos());
        const dAngle = worldMousePos.sub(this.midpoint).angle() - this.prevAngle;

        // Calculate actual new angle
        this.currentAngles = this.currentAngles.map(a => a + dAngle);

        // Get the regular new angle, or snapped angle if shift is held
        const newAngles = input.isShiftKeyDown() ?
                this.currentAngles.map((a) => Math.floor(a/(Math.PI/4))*Math.PI/4) :
                this.currentAngles;

        // Set rotation of each component
        this.components.forEach((c, i) => c.setRotationAbout(newAngles[i], this.midpoint));

        this.prevAngle += dAngle;

        return true;
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
