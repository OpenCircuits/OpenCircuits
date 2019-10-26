import {SHIFT_KEY} from "core/utils/Constants";

import {Vector, V} from "Vector";
import {Transform} from "math/Transform";
import {Camera} from "math/Camera";
import {TransformContains,
        RectContains} from "math/MathUtils";
import {GetAllPorts} from "core/utils/ComponentUtils";

import {Input} from "core/utils/Input";

import {CircuitDesigner} from "core/models/CircuitDesigner";

import {GroupAction} from "../../actions/GroupAction";
import {CreateGroupSelectAction,
        CreateDeselectAllAction} from "../../actions/selection/SelectAction";

import {SelectionTool} from "../SelectionTool";

export class SelectionBox {
    private designer: CircuitDesigner;
    private camera: Camera;

    private selectionTool: SelectionTool;

    // Current selection box positions
    private p1: Vector;
    private p2: Vector;

    private selecting: boolean;

    public constructor(designer: CircuitDesigner, camera: Camera, selectionTool: SelectionTool) {
        this.designer = designer;
        this.camera = camera;

        this.selectionTool = selectionTool;

        this.p1 = V();
        this.p2 = V();
        this.selecting = false;
    }

    public drag(input: Input): void {
        this.selecting = true;

        // Update positions
        this.p1 = input.getMouseDownPos();
        this.p2 = input.getMousePos();
    }

    public stop(input: Input): GroupAction {
        // Stop selection box
        if (!this.selecting)
            return new GroupAction();
        this.selecting = false;

        // Create action
        const group = new GroupAction();

        // Clear selections if no shift key
        if (!input.isKeyDown(SHIFT_KEY))
            group.add(CreateDeselectAllAction(this.selectionTool));

        // Calculate transform rectangle of the selection box
        const p1 = this.camera.getWorldPos(input.getMouseDownPos());
        const p2 = this.camera.getWorldPos(input.getMousePos());
        const box = new Transform(p1.add(p2).scale(0.5), p2.sub(p1).abs());

        // Go through each object and see if it's within
        //  the selection box
        const objects = this.designer.getObjects();
        const selections = objects.filter((obj) => TransformContains(box, obj.getTransform()));

        // Add actions
        group.add(CreateGroupSelectAction(this.selectionTool, selections));

        // Select ports if we haven't selected any regular objects
        if (selections.length == 0) {
            // Get all ports from each object and
            //  Filter out ports within the selection box
            const ports = GetAllPorts(objects);
            const portSelections = ports.filter((port) => RectContains(box, port.getWorldTargetPos()));

            // Add actions
            group.add(CreateGroupSelectAction(this.selectionTool, portSelections));
        }

        return group;
    }

    public deactivate(): void {
        this.selecting = false;
    }

    public getP1(): Vector {
        return this.p1;
    }
    public getP2(): Vector {
        return this.p2;
    }

    public isSelecting(): boolean {
        return this.selecting;
    }
}
