import {V, Vector} from "Vector";

import {Component} from "shared/api/circuit/public";

import {CircuitDesigner}               from "shared/api/circuitdesigner/public/CircuitDesigner";
import {LEFT_MOUSE_BUTTON}             from "shared/api/circuitdesigner/input/Constants";
import {InputAdapterEvent}             from "shared/api/circuitdesigner/input/InputAdapterEvent";
import {SnapToConnections, SnapToGrid} from "shared/api/circuitdesigner/utils/SnapUtils";
import {Tool, ToolEvent}               from "./Tool";
import {ObservableImpl} from "shared/api/circuit/utils/Observable";
import {Cursor} from "../input/Cursor";


export class TranslateTool extends ObservableImpl<ToolEvent> implements Tool {
    private components: Component[];
    private initialPositions: Vector[];

    public constructor() {
        super();

        this.components = [];
        this.initialPositions = [];
    }

    public indicateCouldActivate(ev: InputAdapterEvent, { circuit, viewport }: CircuitDesigner): Cursor | undefined {
        if (circuit.pickObjAt(viewport.toWorldPos(ev.input.mousePos))?.baseKind === "Component")
            return "pointer";
    }
    public shouldActivate(ev: InputAdapterEvent, { curPressedObj }: CircuitDesigner): boolean {
        // Activate if the user is pressing down on a component
        return (
            ev.type === "mousedrag"
                && ev.button === LEFT_MOUSE_BUTTON
                && curPressedObj?.baseKind === "Component"
        );
    }
    public shouldDeactivate(ev: InputAdapterEvent): boolean {
        return (ev.type === "mouseup" && ev.button === LEFT_MOUSE_BUTTON);
    }

    public onActivate(ev: InputAdapterEvent, { circuit, curPressedObj, viewport }: CircuitDesigner): void {
        // If the pressed component is part of the selected objects,
        //  then translate all of the selected objects
        //  otherwise, just translate the pressed object
        this.components = (!curPressedObj || curPressedObj.isSelected)
            ? circuit.selections.components
            : [curPressedObj as Component];

        this.initialPositions = this.components.map((c) => V(c.x, c.y));

        // Set cursor
        viewport.canvasInfo!.cursor = "grabbing";

        circuit.beginTransaction();

        circuit.createContainer(this.components.map((c) => c.id)).shift();
    }

    public onDeactivate(ev: InputAdapterEvent, { circuit }: CircuitDesigner): void {
        circuit.commitTransaction("Moved Objects");
    }

    public onEvent(ev: InputAdapterEvent, { circuit, viewport }: CircuitDesigner): void {
        // Using mousemove instead of mousedrag here because when a button besides
        //  mouse left is released, mousedrag events are no longer created, only mousemove.
        //  So instead mousemove is used and whether or not left mouse is still pressed is
        //  handled within the activation and deactivation of this tool.
        if (ev.type === "mousemove") {
            const snapToGrid = ev.input.isShiftKeyDown;
            const snapToConnections = !ev.input.isShiftKeyDown;

            const dPos = viewport.toWorldPos(ev.input.mousePos)
                .sub(viewport.toWorldPos(ev.input.mouseDownPos));

            // Translate all selected components
            circuit.beginTransaction({ batch: true });
            {
                this.components.forEach((c, i) =>
                    c.pos = this.initialPositions[i].add(dPos));
            }
            circuit.commitTransaction("Moved Components");

            // Apply snapping AFTER to avoid issue #417.
            circuit.beginTransaction({ batch: true });
            {
                this.components.forEach((c) => {
                    if (snapToGrid)
                        c.pos = SnapToGrid(c.pos);
                    if (snapToConnections)
                        c.pos = SnapToConnections(c.pos, c.allPorts);
                });
            }
            circuit.commitTransaction("Snapped Components");
        }
    }
}
