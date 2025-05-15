import {V, Vector} from "Vector";

import {Rect} from "math/Rect";
import {GetNearestPointOnRect} from "math/MathUtils";

import {ObservableImpl}       from "shared/api/circuit/utils/Observable";
import {Circuit, GUID, ICPin} from "shared/api/circuit/public";

import {CircuitDesigner}   from "shared/api/circuitdesigner/public/CircuitDesigner";
import {Viewport}          from "shared/api/circuitdesigner/public/Viewport";
import {LEFT_MOUSE_BUTTON} from "shared/api/circuitdesigner/input/Constants";
import {Cursor}            from "shared/api/circuitdesigner/input/Cursor";
import {InputAdapterEvent} from "shared/api/circuitdesigner/input/InputAdapterEvent";
import {Tool, ToolEvent}   from "shared/api/circuitdesigner/tools/Tool";


export class ICPortTool extends ObservableImpl<ToolEvent> implements Tool {
    private readonly icId: GUID;
    private readonly icInstanceId: GUID;

    private curPin: ICPin | undefined;

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

    private findPin(pos: Vector, circuit: Circuit, viewport: Viewport): ICPin | undefined {
        const ic = this.getIC(circuit), icData = this.getICData(circuit);

        const port = circuit.pickPortAt(viewport.camera.toWorldPos(pos));
        if (!port || port.parent.id !== ic.id)
            return undefined;

        return icData.display.pins.filter((pin) => (pin.group === port.group))[port.index];
    }

    public indicateCouldActivate(ev: InputAdapterEvent, { circuit, viewport }: CircuitDesigner): Cursor | undefined {
        const pin = this.findPin(ev.input.mousePos, circuit, viewport);
        if (!pin)
            return undefined;
        return "move";
    }

    public shouldActivate(ev: InputAdapterEvent, { circuit, viewport }: CircuitDesigner): boolean {
        return (ev.type === "mousedrag" &&
                ev.button === LEFT_MOUSE_BUTTON &&
                ev.input.touchCount === 1 &&
                this.findPin(ev.input.mousePos, circuit, viewport) !== undefined);
    }

    public shouldDeactivate(ev: InputAdapterEvent, { }: CircuitDesigner): boolean {
        return (ev.type === "mouseup");
    }

    public onActivate(ev: InputAdapterEvent, { circuit, viewport }: CircuitDesigner): void {
        this.curPin = this.findPin(ev.input.mousePos, circuit, viewport);

        circuit.beginTransaction();
    }

    public onDeactivate(ev: InputAdapterEvent, { circuit }: CircuitDesigner): void {
        this.curPin = undefined;

        circuit.commitTransaction("Moved IC Ports");
    }


    public onEvent(ev: InputAdapterEvent, { circuit, viewport }: CircuitDesigner): void {
        if (ev.type !== "mousedrag")
            return;

        const ic = this.getIC(circuit), icData = this.getICData(circuit);
        const size = icData.display.size;

        const worldMousePos = viewport.camera.toWorldPos(ev.input.mousePos);

        const p = GetNearestPointOnRect(new Rect(ic.pos, size, true), worldMousePos);

        const dir = (ic.bounds.contains(worldMousePos))
            ? p.sub(worldMousePos)
            : worldMousePos.sub(p);

        // Update pin pos
        this.curPin!.pos = p.scale(V(2 / size.x, 2 / size.y));
        this.curPin!.dir = dir.len() === 0 ? this.curPin!.dir : dir.normalize();
    }
}
