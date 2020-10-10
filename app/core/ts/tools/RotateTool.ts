import {ROTATION_CIRCLE_R1,
        ROTATION_CIRCLE_R2,
        LEFT_MOUSE_BUTTON,
        WIRE_SNAP_THRESHOLD} from "core/utils/Constants";
        

import {Vector} from "Vector";
import {Camera} from "math/Camera";
import {Input} from "core/utils/Input";
import {Tool} from "core/tools/Tool";
import {SelectionTool} from "core/tools/SelectionTool";

import {Component} from "core/models/Component";

import {Wire} from "core/models/Wire";
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
        this.components.forEach(c => this.SnapPos(c));
        this.components.forEach((c, i) => c.setRotationAbout(newAngles[i], this.midpoint));
        this.prevAngle += dAngle;
        

        return true;
    }

    public SnapPos(obj: Component): void {
        function DoSnap(wire: Wire, x: number, c: number): number {
            if (Math.abs(x - c) <= (WIRE_SNAP_THRESHOLD - 5)) {
                wire.setIsStraight(true);
            }
            return x;
        }
    
        const v = obj.getPos();
        // Snap to connections
        for (const port of obj.getPorts()) {
            const pos = port.getWorldTargetPos().sub(obj.getPos());
            const wires = port.getWires();
            for (const w of wires) {
                // Get the port that isn't the current port
                const port2 = (w.getP1() == port ? w.getP2() : w.getP1());
                w.setIsStraight(false);
                v.x = DoSnap(w, v.x + pos.x, port2.getWorldTargetPos().x) - pos.x;
                v.y = DoSnap(w, v.y + pos.y, port2.getWorldTargetPos().y) - pos.y;
            }
        }
        obj.setPos(v);
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
