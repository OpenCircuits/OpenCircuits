import {V} from "Vector";

import {Rect} from "math/Rect";

import {CircuitDesigner}   from "shared/circuitdesigner/CircuitDesigner";
import {InputManagerEvent} from "shared/utils/input/InputManagerEvent";

import {Tool} from "./Tool";


export class SelectionBoxTool implements Tool {
    private rect: Rect;

    public constructor() {
        this.rect = new Rect(V(), V());
    }

    public shouldActivate(ev: InputManagerEvent, { curPressedObj }: CircuitDesigner): boolean {
        // Activate if the user began dragging on empty canvas
        return (
            ev.type === "mousedrag" &&
            ev.state.touchCount === 1 &&
            curPressedObj === undefined
        );
    }
    public shouldDeactivate(ev: InputManagerEvent): boolean {
        return (ev.type === "mouseup");
    }

    public onActivate(ev: InputManagerEvent, { circuit }: CircuitDesigner): void {
        this.rect = Rect.FromPoints(
            circuit.camera.toWorldPos(ev.state.mouseDownPos),
            circuit.camera.toWorldPos(ev.state.mousePos),
        );
    }

    public onDeactivate(ev: InputManagerEvent, { circuit }: CircuitDesigner): void {
        // Find all objects within the selection box
        const objs = circuit.pickObjRange(this.rect);

        const deselectAll = (!ev.state.isShiftKeyDown && circuit.selectedObjs.length > 0);

        // If nothing was clicked, check if we should deselect and exit
        if (objs.length === 0) {
            // Clear selections if not holding shift
            if (deselectAll)
                circuit.clearSelections();
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
            circuit.clearSelections();
        objsToSelect.forEach((o) => o.select());

        circuit.commitTransaction();
    }

    public onEvent(ev: InputManagerEvent, { circuit }: CircuitDesigner): void {
        if (ev.type === "mousedrag") {
            this.rect = Rect.FromPoints(
                circuit.camera.toWorldPos(ev.state.mouseDownPos),
                circuit.camera.toWorldPos(ev.state.mousePos),
            );

            circuit.forceRedraw();
        }
    }

    public getBounds(): Rect {
        return this.rect;
    }
}
