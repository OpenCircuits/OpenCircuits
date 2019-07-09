import {LEFT_MOUSE_BUTTON,
        DELETE_KEY, BACKSPACE_KEY,
        ESC_KEY, A_KEY, X_KEY,
        IO_PORT_RADIUS} from "../Constants";
import {Vector,V} from "../math/Vector";
import {CircleContains,
        BezierContains,} from "../math/MathUtils";

import {Selectable} from "../Selectable";
import {Tool} from "./Tool";

import {CircuitDesigner} from "../../models/CircuitDesigner";
import {IOObject} from "../../models/ioobjects/IOObject";
import {Component} from "../../models/ioobjects/Component";
import {WirePort} from "../../models/ioobjects/other/WirePort";

import {PlaceComponentTool} from "./PlaceComponentTool"

import {SelectionBox} from "./helpers/SelectionBox";
import {InteractionHelper} from "./helpers/InteractionHelper";

import {Input} from "../Input";
import {Camera} from "../Camera";

import {Action} from "../actions/Action";
import {GroupAction} from "../actions/GroupAction"
import {ShiftAction} from "../actions/ShiftAction";
import {SelectAction,
        DeselectAction,
        CreateGroupSelectAction,
        CreateDeselectAllAction} from "../actions/selection/SelectAction";
import {CreateGroupSnipAction} from "../actions/addition/SplitWireAction";
import {CreateDeleteGroupAction} from "../actions/deletion/DeleteGroupActionFactory";

export class SelectionTool extends Tool {

    private designer: CircuitDesigner;
    private camera: Camera;

    private selections: Set<Selectable>;

    // These functions are called every time the selections change
    // TODO: pass selections as argument
    private callbacks: Array<{ (): void }>;

    private selectionBox: SelectionBox;
    private interactionHelper: InteractionHelper;

    private disabledSelections: boolean;

    private action: GroupAction;

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


    public setCurrentlyPressedObj(obj: IOObject): void {
        this.interactionHelper.setCurrentlyPressedObj(obj);
    }

    public addSelectionChangeListener(func: {(): void}): void {
        this.callbacks.push(func);
    }

    public disableSelections(val: boolean = true): void {
        this.disabledSelections = val;
    }



    public activate(currentTool: Tool, event: string, input: Input, button?: number): boolean {
        if (event == "mouseup")
            this.onMouseUp(input, button);
        if (event == "onclick" && !(currentTool instanceof PlaceComponentTool))
            this.onClick(input, button);
        return false;
    }

    public deactivate(): boolean {
        this.selectionBox.deactivate();

        return false;
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
            return false;
        this.action.add(action.execute());

        return true;
    }

    public onClick(input: Input, button: number): boolean {
        if (button !== LEFT_MOUSE_BUTTON)
            return false;

        const worldMousePos = this.camera.getWorldPos(input.getMousePos());

        let render = false;

        // Clear selections if no shift key
        if (!input.isShiftKeyDown()) {
            this.action.add(CreateDeselectAllAction(this).execute());
            render = true; // Render if selections were actually cleared
        }

        // Check if a pressable object was clicked
        const objects = this.designer.getObjects().reverse();
        if (this.interactionHelper.click(input))
            return true;

        // Find selected object
        const selectedObj = objects.find((o) => o.isWithinSelectBounds(worldMousePos));
        if (selectedObj) {
            // If we're holding shift then deselect the object if it's selected
            const deselect = (input.isShiftKeyDown() && this.selections.has(selectedObj));
            this.action.add(new SelectAction(this, selectedObj, deselect).execute());
            this.action.add(new ShiftAction(selectedObj).execute());
            return true;
        }

        // Check if a port was clicked
        if (objects.some((o) => o.getPorts().some(
                (p) => CircleContains(p.getWorldTargetPos(), IO_PORT_RADIUS, worldMousePos))))
            return false;

        // Check if a wire was clicked then select it
        const w = this.designer.getWires().find((w) => BezierContains(w.getShape(), worldMousePos));
        if (w) {
            this.action.add(new DeselectAction(this, w).execute());
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

        if (this.selections.size == 0)
            return false;

        if (key == DELETE_KEY || key == BACKSPACE_KEY) {
            const selections = Array.from(this.selections);
            const objs = selections.filter(o => o instanceof IOObject) as Array<IOObject>;

            this.action.add(CreateDeleteGroupAction(objs).execute());

            return true;
        }
        if (key == X_KEY) { // Snip wire port(s)
            const selections = Array.from(this.selections);
            const wirePorts = selections.filter((o) => o instanceof WirePort) as Array<WirePort>;
            if (selections.length != wirePorts.length)
                return false;
            this.action.add(CreateDeselectAllAction(this).execute());
            this.action.add(CreateGroupSnipAction(wirePorts).execute());
            return true;
        }
        if (key == ESC_KEY) {
            this.action.add(CreateDeselectAllAction(this).execute());
            return true;
        }

        return false;
    }


    public calculateMidpoint(): Vector {
        const selections = Array.from(this.selections);
        return selections.filter(o => o instanceof Component)
                .map(o => o as Component)
                .reduce((acc, cur) => acc.add(cur.getPos()), V(0,0))
                .scale(1. / this.selections.size);
    }

    public getAction(): Action {
        if (this.action.isEmpty())
            return undefined;

        const action = this.action;

        // Clear action
        this.action = new GroupAction();

        return action;
    }

    public getSelections(): Array<Selectable> {
        return Array.from(this.selections);
    }

    public getSelectionBox(): SelectionBox {
        return this.selectionBox;
    }

    public getCurrentlyPressedObj(): IOObject {
        return this.interactionHelper.getCurrentlyPressedObj();
    }

}
