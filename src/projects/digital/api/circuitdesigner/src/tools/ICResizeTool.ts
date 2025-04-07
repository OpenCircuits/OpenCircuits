
import {V, Vector} from "Vector";

import {RectContains} from "math/MathUtils";
import {Transform}    from "math/Transform";

import {ObservableImpl} from "shared/api/circuit/utils/Observable";
import {CircuitDesigner} from "shared/api/circuitdesigner/public/CircuitDesigner";
import {InputAdapterEvent} from "shared/api/circuitdesigner/input/InputAdapterEvent";
import {LEFT_MOUSE_BUTTON} from "shared/api/circuitdesigner/input/Constants";
import {Tool, ToolEvent} from "shared/api/circuitdesigner/tools/Tool";
import {Circuit, GUID} from "shared/api/circuit/public";
import {Viewport} from "shared/api/circuitdesigner/public/Viewport";


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

        circuit.commitTransaction();
    }


    public onEvent(ev: InputAdapterEvent, { circuit, viewport }: CircuitDesigner): void {
        if (ev.type !== "mousedrag")
            return;

        const ic = this.getIC(circuit);

        const dPos = viewport.camera.toWorldPos(ev.input.mousePos)
            .sub(viewport.camera.toWorldPos(ev.input.mouseDownPos));

        const newSize = this.initialSize.add(dPos.scale(2)).abs();

        if (this.edge === "horizontal")
            data.setSize(V(newSize.x, this.initialSize.y));
        else if (this.edge === "vertical")
            data.setSize(V(this.initialSize.x, newSize.y));

        data.positionPorts();
        ic.update();
    }
}
