import {GRID_SIZE,
        LEFT_MOUSE_BUTTON,
        SPACEBAR_KEY,
        WIRE_SNAP_THRESHOLD} from "core/utils/Constants";

import {Vector,V} from "Vector";
import {Camera} from "math/Camera";
import {Input} from "core/utils/Input";
import {Tool} from "core/tools/Tool";

import {SelectionTool} from "core/tools/SelectionTool";

import {Component} from "core/models/Component";

import {Action} from "core/actions/Action";
import {GroupAction} from "core/actions/GroupAction";
import {CopyGroupAction} from "core/actions/CopyGroupAction";
import {CreateGroupPostTranslateAction} from "core/actions/transform/GroupPostTranslateActionFactory";
import {Wire} from "core/models/Wire";

function SnapPos(obj: Component): void {
    function DoSnap(wire: Wire, x: number, c: number): number {
        if (Math.abs(x - c) <= WIRE_SNAP_THRESHOLD) {
            wire.setIsStraight(true);
            return c;
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

export class TranslateTool extends Tool {
    protected camera: Camera;

    protected pressedComponent: Component;
    protected components: Component[];
    protected initialPositions: Vector[];

    private action: GroupAction;

    public constructor(camera: Camera) {
        super();

        this.camera = camera;
    }

    public shouldActivate(currentTool: Tool, event: string, _input: Input): boolean {
        if (!(currentTool instanceof SelectionTool))
            return false;
        if (!(event == "mousedrag"))
            return false;

        // Make sure everything is a component
        const selections = currentTool.getSelections();
        const currentPressedObj = currentTool.getCurrentlyPressedObj();
        if (!(currentPressedObj instanceof Component))
            return false;
        if (selections.some((e) => !(e instanceof Component)))
            return false;

        return true;
    }

    public activate(currentTool: Tool, _: string, input: Input, __?: number, pressedObj?: Component): void {
        if (!(currentTool instanceof SelectionTool))
            throw new Error("Tool not selection tool!");

        const selections = currentTool.getSelections() as Component[];
        const currentPressedObj = pressedObj || currentTool.getCurrentlyPressedObj() as Component;

        // Translate multiple objects if they are all selected
        this.pressedComponent = currentPressedObj;
        this.components = [currentPressedObj];
        if (selections.includes(currentPressedObj))
            this.components = selections;

        // Copy initial positions
        this.initialPositions = this.components.map((o) => o.getPos());

        this.action = new GroupAction();

        // Explicitly drag
        this.onMouseDrag(input, 0);
    }

    public shouldDeactivate(event: string, _: Input): boolean {
        return (event == "mouseup");
    }

    public deactivate(): Action {
        this.action.add(CreateGroupPostTranslateAction(this.components, this.initialPositions).execute());

        return this.action;
    }

    public onMouseDrag(input: Input, button: number): boolean {
        if (button !== LEFT_MOUSE_BUTTON)
            return false;

        const worldMouseDownPos = this.camera.getWorldPos(input.getMouseDownPos());
        const worldMousePos = this.camera.getWorldPos(input.getMousePos());

        // Find change in position by subtracting current pos by initial pos
        const dPos = worldMousePos.sub(worldMouseDownPos);

        // Calculate new positions
        const newPositions = this.initialPositions.map((p) => p.add(dPos));

        // Calculate positions if shifted
        const shiftedPositions = input.isShiftKeyDown() ?
                newPositions.map((p) => V(Math.floor(p.x/GRID_SIZE + 0.5) * GRID_SIZE,
                                          Math.floor(p.y/GRID_SIZE + 0.5) * GRID_SIZE)) :
                newPositions;

        // Execute translate but don't save to group action since we do that in 'deactivate'
        this.components.forEach((c, i) => c.setPos(shiftedPositions[i]));

        // Snap at the end instead of one-by-one (fixes #417)
        this.components.forEach(c => SnapPos(c));

        return true;
    }

    public onKeyUp(_: Input, key: number): boolean {
        // Duplicate group when we press the spacebar
        if (key == SPACEBAR_KEY) {
            const designer = this.components[0].getDesigner();
            this.action.add(new CopyGroupAction(designer, this.components).execute());

            return true;
        }
        return false;
    }

}
