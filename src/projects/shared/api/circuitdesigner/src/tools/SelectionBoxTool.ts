import {V} from "Vector";

import {Rect} from "math/Rect";

import {CircuitDesigner}   from "shared/api/circuitdesigner/public/CircuitDesigner";
import {InputAdapterEvent} from "shared/src/utils/input/InputAdapterEvent";

import {Tool} from "./Tool";


export class SelectionBoxTool implements Tool {
    private rect: Rect;

    public constructor() {
        this.rect = new Rect(V(), V());
    }

    public shouldActivate(ev: InputAdapterEvent, { curPressedObj }: CircuitDesigner): boolean {
        // Activate if the user began dragging on empty canvas
        return (
            ev.type === "mousedrag" &&
            ev.input.touchCount === 1 &&
            curPressedObj === undefined &&
            ev.button === 0
        );
    }
    public shouldDeactivate(ev: InputAdapterEvent): boolean {
        return (ev.type === "mouseup");
    }

    public onActivate(ev: InputAdapterEvent, { viewport }: CircuitDesigner): void {
        this.rect = Rect.FromPoints(
            viewport.camera.toWorldPos(ev.input.mouseDownPos),
            viewport.camera.toWorldPos(ev.input.mousePos),
        );
    }

    public onDeactivate(ev: InputAdapterEvent, { circuit }: CircuitDesigner): void {
        // Find all objects within the selection box
        const objs = circuit.pickObjRange(this.rect);

        const deselectAll = (!ev.input.isShiftKeyDown && circuit.selections.length > 0);

        // If nothing was clicked, check if we should deselect and exit
        if (objs.length === 0) {
            // Clear selections if not holding shift
            if (deselectAll)
                circuit.selections.clear();
            return;
        }

        // If the user selects a group of objects, we want to only select the components
        //  and ignore any ports that may have also been selected. We only want to
        //  select Ports if they user only selected ports
        const nonPortObjs = objs.filter((o) => (o.baseKind !== "Port"));

        // If there are no non-port objects, then `objects` has all the ports and select them.
        // Otherwise, select just the non-port objects.
        const objsToSelect = ((nonPortObjs.length === 0) ? objs : nonPortObjs);

        circuit.beginTransaction();

        if (deselectAll)
            circuit.selections.clear();
        objsToSelect.forEach((o) => o.select());

        circuit.commitTransaction();
    }

    public onEvent(ev: InputAdapterEvent, { viewport }: CircuitDesigner): void {
        if (ev.type === "mousedrag") {
            this.rect = Rect.FromPoints(
                viewport.camera.toWorldPos(ev.input.mouseDownPos),
                viewport.camera.toWorldPos(ev.input.mousePos),
            );

            // circuit.forceRedraw();
        }
    }

    public getBounds(): Rect {
        return this.rect;
    }
}
