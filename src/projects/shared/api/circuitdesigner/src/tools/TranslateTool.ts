import {V, Vector} from "Vector";

import {Component} from "shared/api/circuit/public";

import {CircuitDesigner}               from "shared/api/circuitdesigner/public/CircuitDesigner";
import {LEFT_MOUSE_BUTTON}             from "shared/src/utils/input/Constants";
import {InputAdapterEvent}             from "shared/src/utils/input/InputAdapterEvent";
import {SnapToConnections, SnapToGrid} from "shared/src/utils/SnapUtils";
import {Tool}                          from "./Tool";


export class TranslateTool implements Tool {
    private components: Component[];
    private initialPositions: Vector[];

    public constructor() {
        this.components = [];
        this.initialPositions = [];
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

    public onActivate(ev: InputAdapterEvent, { circuit, curPressedObj }: CircuitDesigner): void {
        // If the pressed component is part of the selected objects,
        //  then translate all of the selected objects
        //  otherwise, just translate the pressed object
        this.components = (!curPressedObj || curPressedObj.isSelected)
            ? circuit.selections.components
            : [curPressedObj as Component];

        this.initialPositions = this.components.map((c) => V(c.x, c.y));

        circuit.beginTransaction();

        // TODO[model_refactor_api](leon): shift components
    }

    public onDeactivate(ev: InputAdapterEvent, { circuit }: CircuitDesigner): void {
        circuit.commitTransaction();
    }

    public onEvent(ev: InputAdapterEvent, { viewport }: CircuitDesigner): void {
        // Using mousemove instead of mousedrag here because when a button besides
        //  mouse left is released, mousedrag events are no longer created, only mousemove.
        //  So instead mousemove is used and whether or not left mouse is still pressed is
        //  handled within the activation and deactivation of this tool.
        if (ev.type === "mousemove") {
            const snapToGrid = ev.input.isShiftKeyDown;
            const snapToConnections = !ev.input.isShiftKeyDown;

            const dPos = viewport.camera.toWorldPos(ev.input.mousePos)
                .sub(viewport.camera.toWorldPos(ev.input.mouseDownPos));

            // Translate all selected components
            this.components.forEach((c, i) =>
                c.pos = this.initialPositions[i].add(dPos));

            // Apply snapping AFTER to avoid issue #417.
            this.components.forEach((c) => {
                if (snapToGrid)
                    c.pos = SnapToGrid(c.pos);
                if (snapToConnections)
                    c.pos = SnapToConnections(c.pos, c.allPorts);
            });
        }
    }
}
