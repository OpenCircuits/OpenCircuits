import {V, Vector} from "Vector";

import {RectContains} from "math/MathUtils";
import {Transform}    from "math/Transform";

import {ObservableImpl}    from "shared/api/circuit/utils/Observable";
import {Circuit, GUID}     from "shared/api/circuit/public";

import {CircuitDesigner}   from "shared/api/circuitdesigner/public/CircuitDesigner";
import {Viewport}          from "shared/api/circuitdesigner/public/Viewport";
import {LEFT_MOUSE_BUTTON} from "shared/api/circuitdesigner/input/Constants";
import {Cursor}            from "shared/api/circuitdesigner/input/Cursor";
import {InputAdapterEvent} from "shared/api/circuitdesigner/input/InputAdapterEvent";
import {Tool, ToolEvent}   from "shared/api/circuitdesigner/tools/Tool";


export type ICEdge = "horizontal" | "vertical" | "none";

export class ICResizeTool extends ObservableImpl<ToolEvent> implements Tool {
    private readonly icId: GUID;
    private readonly icInstanceId: GUID;

    private edge: ICEdge = "none";
    private initialSize: Vector = V();

    public constructor(icId: GUID, icInstanceId: GUID) {
        super();

        this.icId = icId;
        this.icInstanceId = icInstanceId;
    }

    private getIC(circuit: Circuit) {
        const ic = circuit.getComponent(this.icInstanceId);
        if (!ic)
            throw new Error(`ICResizeTool.findEdge: failed could not find IC instance with id ${this.icInstanceId}`);
        return ic;
    }

    private getICData(circuit: Circuit) {
        const icData = circuit.getIC(this.icId);
        if (!icData)
            throw new Error(`ICResizeTool.findEdge: failed to find IC data for id ${this.icId}`);
        return icData;
    }

    private findEdge(pos: Vector, circuit: Circuit, viewport: Viewport): ICEdge {
        const EDGE_BUFFER = 0.2;

        const ic = this.getIC(circuit), icData = this.getICData(circuit);

        // Create slightly larger and smaller box and check
        //  if the mouse is between the two for an edge check
        const t1 = new Transform(ic.pos, icData.display.size.add(EDGE_BUFFER));
        const t2 = new Transform(ic.pos, icData.display.size.sub(EDGE_BUFFER));

        const worldMousePos = viewport.camera.toWorldPos(pos);
        if (!(RectContains(t1, worldMousePos) && !RectContains(t2, worldMousePos)))
            return "none";

        // Determine if mouse is over horizontal or vertical edge
        return (worldMousePos.y < ic.pos.y + icData.display.size.y/2 - EDGE_BUFFER/2 &&
                worldMousePos.y > ic.pos.y - icData.display.size.y/2 + EDGE_BUFFER/2)
               ? "horizontal"
               : "vertical";
    }

    public indicateCouldActivate(ev: InputAdapterEvent, { circuit, viewport }: CircuitDesigner): Cursor | undefined {
        const edge = this.findEdge(ev.input.mousePos, circuit, viewport);
        if (edge === "none")
            return undefined;
        return (edge === "horizontal" ? "ew-resize" : "ns-resize");
    }

    public shouldActivate(ev: InputAdapterEvent, { circuit, viewport }: CircuitDesigner): boolean {
        return (ev.type === "mousedrag" &&
                ev.button === LEFT_MOUSE_BUTTON &&
                ev.input.touchCount === 1 &&
                this.findEdge(ev.input.mousePos, circuit, viewport) !== "none");
    }

    public shouldDeactivate(ev: InputAdapterEvent, { }: CircuitDesigner): boolean {
        return (ev.type === "mouseup");
    }

    public onActivate(ev: InputAdapterEvent, { circuit, viewport }: CircuitDesigner): void {
        this.edge = this.findEdge(ev.input.mousePos, circuit, viewport);
        this.initialSize = this.getICData(circuit).display.size;

        circuit.beginTransaction();
    }

    public onDeactivate(ev: InputAdapterEvent, { circuit }: CircuitDesigner): void {
        this.edge = "none";

        circuit.commitTransaction("Resized IC");
    }


    public onEvent(ev: InputAdapterEvent, { circuit, viewport }: CircuitDesigner): void {
        if (ev.type !== "mousedrag")
            return;

        const ic = this.getIC(circuit), icData = this.getICData(circuit);

        const worldMousePos = viewport.camera.toWorldPos(ev.input.mousePos);

        const newSize = worldMousePos.sub(ic.pos).scale(2).abs();

        if (this.edge === "horizontal")
            icData.display.size = V(newSize.x, this.initialSize.y);
        else if (this.edge === "vertical")
            icData.display.size = V(this.initialSize.x, newSize.y);
    }
}
