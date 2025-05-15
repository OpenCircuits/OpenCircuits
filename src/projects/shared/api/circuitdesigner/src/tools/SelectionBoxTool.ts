import {V} from "Vector";

import {Rect} from "math/Rect";

import {CircuitDesigner}   from "shared/api/circuitdesigner/public/CircuitDesigner";
import {InputAdapterEvent} from "shared/api/circuitdesigner/input/InputAdapterEvent";

import {Tool, ToolEvent} from "./Tool";
import {ObservableImpl} from "shared/api/circuit/utils/Observable";


export class SelectionBoxTool extends ObservableImpl<ToolEvent> implements Tool {
    private rect: Rect;

    public constructor() {
        super();

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
        const deselectAll = (!ev.input.isShiftKeyDown && circuit.selections.length > 0);

        // Find all components that are within the selection box
        const comps = circuit.getComponents()
            .filter((c) => c.bounds.intersects(this.rect));
        if (comps.length > 0) {
            // If there are components, just select those
            circuit.beginTransaction();
            if (deselectAll)
                circuit.selections.clear();
            comps.forEach((c) => c.select());
            circuit.commitTransaction("Selected Components");
            return;
        }

        // Otherwise if no components were found, find all ports that may be in-bounds and return those.
        const ports = circuit.getObjs()
            .filter((o) => (o.baseKind === "Port" && o.bounds.intersects(this.rect)));
        if (ports.length > 0) {
            circuit.beginTransaction();
            if (deselectAll)
                circuit.selections.clear();
            ports.forEach((c) => c.select());
            circuit.commitTransaction("Selected Ports");
            return;
        }

        // Else just deselect if not holding shift
        if (deselectAll)
            circuit.selections.clear();
    }

    public onEvent(ev: InputAdapterEvent, { viewport }: CircuitDesigner): void {
        if (ev.type === "mousedrag") {
            this.rect = Rect.FromPoints(
                viewport.camera.toWorldPos(ev.input.mouseDownPos),
                viewport.camera.toWorldPos(ev.input.mousePos),
            );

            this.publish({ type: "statechange" });
        }
    }

    public getBounds(): Rect {
        return this.rect;
    }
}
