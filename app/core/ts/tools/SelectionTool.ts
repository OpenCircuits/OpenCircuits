import {LEFT_MOUSE_BUTTON, DELETE_KEY,
        BACKSPACE_KEY, ESC_KEY,
        A_KEY, D_KEY, F_KEY, X_KEY,
        FIT_PADDING_RATIO} from "core/utils/Constants";
import {Vector, V} from "Vector";
import {Camera} from "math/Camera";

import {Selectable} from "core/utils/Selectable";
import {Input} from "core/utils/Input";
import {GetCameraFit} from "core/utils/ComponentUtils";

import {IOObject} from "core/models/IOObject";
import {CullableObject} from "core/models/CullableObject";
import {Wire} from "core/models/Wire";
import {Component} from "core/models/Component";
import {Node, isNode} from "core/models/Node";
import {CircuitDesigner} from "core/models/CircuitDesigner";
import {GetPath} from "core/utils/ComponentUtils";

import {Action} from "core/actions/Action";
import {GroupAction} from "core/actions/GroupAction"
import {ShiftAction} from "core/actions/ShiftAction";
import {SelectAction,
        CreateGroupSelectAction,
        CreateDeselectAllAction} from "core/actions/selection/SelectAction";
import {CopyGroupAction} from "core/actions/CopyGroupAction";
import {CreateGroupSnipAction} from "core/actions/addition/SplitWireAction";
import {CreateDeleteGroupAction} from "core/actions/deletion/DeleteGroupActionFactory";
import {CreateGroupTranslateAction} from "core/actions/transform/TranslateAction";
import {MoveCameraAction} from "core/actions/camera/MoveCameraAction";

import {Tool} from "./Tool";
import {DefaultTool} from "./DefaultTool";
import {PlaceComponentTool} from "./PlaceComponentTool"

import {SelectionBox} from "./helpers/SelectionBox";
import {InteractionHelper} from "./helpers/InteractionHelper";

export class SelectionTool extends DefaultTool {
    protected designer: CircuitDesigner;
    protected camera: Camera;

    protected selections: Set<Selectable>;

    // These functions are called every time the selections change
    // TODO: pass selections as argument
    private callbacks: Array<{ (): void }>;

    private selectionBox: SelectionBox;
    private interactionHelper: InteractionHelper;

    private disabledSelections: boolean;

    protected action: GroupAction;

    public constructor(designer: CircuitDesigner, camera: Camera) {
        super();

        this.designer = designer;
        this.camera = camera;

        this.selections = new Set();

        this.selectionBox = new SelectionBox(designer, camera, this);
        this.interactionHelper = new InteractionHelper(designer, camera);

        this.disabledSelections = false;

        this.action = new GroupAction();

        this.callbacks = [];
    }


    private selectionsChanged(): void {
        this.callbacks.forEach(c => c());
    }

    private shouldDeselect(obj: IOObject, shift: boolean): boolean {
        // If we're holding shift then deselect the object if it's selected
        return (shift && this.selections.has(obj));
    }


    public select(obj: Selectable): boolean {
        // Don't select anything if it's disabled
        if (this.disabledSelections)
            return false;
        if (this.selections.has(obj))
            return false;

        this.selections.add(obj);
        this.selectionsChanged();

        return true;
    }

    public deselect(obj: Selectable): boolean {
        // Don't deselect anything if it's disabled
        if (this.disabledSelections)
            return false;

        if (this.selections.delete(obj)) {
            this.selectionsChanged();
            return true;
        }
        return false;
    }


    public addSelectionChangeListener(func: {(): void}): void {
        this.callbacks.push(func);
    }

    public disableSelections(val: boolean = true): void {
        this.disabledSelections = val;
    }



    public activate(currentTool: Tool, event: string, input: Input, button?: number): void {
        if (event == "mouseup")
            this.onMouseUp(input, button);
        if (event == "onclick" && !(currentTool instanceof PlaceComponentTool))
            this.onClick(input, button);
    }

    public deactivate(): Action {
        this.selectionBox.deactivate();

        return undefined;
    }


    public onMouseDown(input: Input, button: number): boolean {
        if (button !== LEFT_MOUSE_BUTTON)
            return false;
        return this.interactionHelper.press(input);
    }

    public onMouseDrag(input: Input, button: number): boolean {
        if (button !== LEFT_MOUSE_BUTTON)
            return false;

        if (!this.disabledSelections && input.getTouchCount() == 1) {
            this.selectionBox.drag(input);
            return true; // should render
        }

        return false;
    }

    public onMouseUp(input: Input, button: number): boolean {
        if (button !== LEFT_MOUSE_BUTTON)
            return false;

        if (this.interactionHelper.release())
            return true;

        const action = this.selectionBox.stop(input);
        if (action.isEmpty())
            return true;
        this.action.add(action.execute());

        return true;
    }

    public onClick(input: Input, button: number): boolean {
        if (button !== LEFT_MOUSE_BUTTON)
            return false;
        const worldMousePos = this.camera.getWorldPos(input.getMousePos());

        let render = false;

        // Check if a pressable object was clicked
        if (this.interactionHelper.click(input))
            return true;

        // Clear selections if no shift keys
        if (!input.isShiftKeyDown()) {
            render = (this.selections.size > 0); // Render if selections were actually cleared
            this.action.add(CreateDeselectAllAction(this).execute());
        }

        const objects = this.designer.getObjects().reverse();
        const wires = this.designer.getWires().reverse();
        const objs = (objects as (Component | Wire)[]).concat(wires);

        // Check if an object was clicked
        const obj = objs.find(o => o.isWithinSelectBounds(worldMousePos));

        // Return early if we clicked a wire and if a port was clicked because we want to prioritize that
        if (obj instanceof Wire) {
            if (objects.some((o) => o.getPorts().some(p => p.isWithinSelectBounds(worldMousePos))))
                return false;
        }

        // Select object
        if (obj) {
            const deselect = this.shouldDeselect(obj, input.isShiftKeyDown());
            this.action.add(new SelectAction(this, obj, deselect).execute());
            this.action.add(new ShiftAction(obj).execute());
            return true;
        }

        return render;
    }

    public onDoubleClick(input: Input, button: number): boolean {
        const worldMousePos = this.camera.getWorldPos(input.getMousePos());

        let render = false;

        // Clear selections if no shift keys
        if (!input.isShiftKeyDown()) {
            // Render if selections were actually cleared
            render = (this.selections.size > 0);
            this.action.add(CreateDeselectAllAction(this).execute());
        }

        const wires = this.designer.getWires().reverse();

        // Check if a wire object was clicked
        const wire = wires.find(o => o.isWithinSelectBounds(worldMousePos));
        // If a wire is selected
        if (wire) {
            // Add CreateGroupSelectAction to this.action
            this.action.add(CreateGroupSelectAction(this, GetPath(wire)).execute());
            return true;
        }
        return render;
    }

    public onKeyDown(input: Input, key: number): boolean {
        // If modifier key and a key are pressed, select all
        if (input.isModifierKeyDown() && key == A_KEY) {
            this.action.add(CreateGroupSelectAction(this, this.designer.getObjects()).execute());
            return true;
        }

        // Fit to screen command
        if (key === F_KEY) {
            // Fit to selections, if any; otherwise, fit all CullableObjects
            const objs = this.selections.size === 0
                ? (this.designer.getObjects() as CullableObject[]).concat(this.designer.getWires())
                : this.getSelections().filter(o => o instanceof CullableObject) as CullableObject[];

            // Get tuple of final camera position and zoom
            const finalCamera = GetCameraFit(this.camera, objs, FIT_PADDING_RATIO);
            this.action.add(new MoveCameraAction(this.camera, finalCamera[0], finalCamera[1]).execute());
            return true;
        }

        if (this.selections.size == 0)
            return false;

        // CTRL/CMD + D to duplicate selected objects
        if (input.isModifierKeyDown() && key == D_KEY) {
            const selections = Array.from(this.selections);
            const objs = selections.filter(o => o instanceof IOObject) as IOObject[];
            const action = new CopyGroupAction(this.designer, objs);
            const newObjs = action.getCopies();
            const comps = newObjs.getComponents();

            // Copy the group and then select them and move them over slightly
            this.action.add(action.execute());
            this.action.add(CreateDeselectAllAction(this).execute());
            this.action.add(CreateGroupSelectAction(this, newObjs.toList()).execute());
            this.action.add(CreateGroupTranslateAction(comps, comps.map((o) => o.getPos().add(V(5, 5)))).execute());

            return true;
        }

        // DELETE to remove selected objects
        if (key == DELETE_KEY || key == BACKSPACE_KEY) {
            const selections = Array.from(this.selections);
            const objs = selections.filter(o => o instanceof IOObject) as IOObject[];

            this.action.add(CreateDeselectAllAction(this).execute());
            this.action.add(CreateDeleteGroupAction(objs).execute());

            return true;
        }

        // X to snip selected wireports
        if (key == X_KEY) { // Snip wire port(s)
            const selections = Array.from(this.selections);
            const wirePorts = selections.filter((o) => isNode(o)) as Node[];
            if (selections.length != wirePorts.length)
                return false;
            this.action.add(CreateDeselectAllAction(this).execute());
            this.action.add(CreateGroupSnipAction(wirePorts).execute());
            return true;
        }

        // ESC to deselect everything
        if (key == ESC_KEY) {
            this.action.add(CreateDeselectAllAction(this).execute());
            return true;
        }

        return false;
    }


    public calculateMidpoint(): Vector {
        const selections = Array.from(this.selections);
        const positions = selections.filter((s) => s instanceof Component)
                .map((s) => s as Component)
                .map((c) => c.getPos());
        return positions.reduce((acc, cur) => acc.add(cur), V(0, 0))
                .scale(1. / positions.length);
    }

    public getAction(): Action {
        if (this.action.isEmpty())
            return undefined;
        const action = this.action;

        // Clear action
        this.action = new GroupAction();

        return action;
    }

    public getSelections(): Selectable[] {
        return Array.from(this.selections);
    }

    public getSelectionBox(): SelectionBox {
        return this.selectionBox;
    }

    public getCurrentlyPressedObj(): Selectable {
        return this.interactionHelper.getCurrentlyPressedObj();
    }

}
