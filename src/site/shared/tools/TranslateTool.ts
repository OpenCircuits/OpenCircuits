import {V} from "Vector";

import {Component} from "core/public";

import {CircuitDesigner}               from "shared/circuitdesigner/CircuitDesigner";
import {LEFT_MOUSE_BUTTON}             from "shared/utils/input/Constants";
import {InputAdapterEvent}             from "shared/utils/input/InputAdapterEvent";
import {SnapToConnections, SnapToGrid} from "shared/utils/SnapUtils";
import {Tool}                          from "./Tool";


export class TranslateTool implements Tool {
    private components: Component[];

    public constructor() {
        this.components = [];
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

            const dPos = ev.input.deltaMousePos.scale(V(viewport.camera.zoom, -viewport.camera.zoom));

            this.components.forEach((c) => {
                let pos = V(c.x, c.y).add(dPos);
                if (snapToGrid)
                    pos = SnapToGrid(pos);
                if (snapToConnections)
                    pos = SnapToConnections(pos, c.allPorts);
                // Very specifically Translate as we go
                //  as to correctly apply `SnapToConnections`
                c.pos = pos;
            });
        }
    }
}
