/* eslint-disable @typescript-eslint/no-parameter-properties */
import {V, Vector} from "Vector";

import {GUID} from "shared/api/circuit/internal";

import {CircuitContext} from "./CircuitContext";
import {ICPin, IntegratedCircuit, IntegratedCircuitDisplay} from "../IntegratedCircuit";
import {CircuitAPITypes} from "./Types";


class IntegratedCircuitPinImpl<T extends CircuitAPITypes> implements ICPin {
    protected readonly icId: GUID;
    protected readonly pinIndex: number;

    protected readonly ctx: CircuitContext<T>;

    public constructor(ctx: CircuitContext<T>, icId: GUID, pinIndex: number) {
        this.ctx = ctx;
        this.icId = icId;
        this.pinIndex = pinIndex;
    }

    protected get ic() {
        return this.ctx.internal.getICInfo(this.icId).unwrap();
    }

    public get id(): GUID {
        return this.ic.metadata.pins[this.pinIndex].id;
    }
    public get group(): GUID {
        return this.ic.metadata.pins[this.pinIndex].group;
    }

    public get name(): string {
        return this.ic.metadata.pins[this.pinIndex].name;
    }

    public set pos(p: Vector) {
        this.ctx.internal.beginTransaction();
        this.ctx.internal.updateICPinMetadata(this.icId, this.pinIndex, { x: p.x, y: p.y }).unwrap();
        this.ctx.internal.commitTransaction();
    }
    public get pos(): Vector {
        return V(
            this.ic.metadata.pins[this.pinIndex].x,
            this.ic.metadata.pins[this.pinIndex].y,
        );
    }

    public set dir(d: Vector) {
        this.ctx.internal.beginTransaction();
        this.ctx.internal.updateICPinMetadata(this.icId, this.pinIndex, { dx: d.x, dy: d.y }).unwrap();
        this.ctx.internal.commitTransaction();
    }
    public get dir(): Vector {
        return V(
            this.ic.metadata.pins[this.pinIndex].dx,
            this.ic.metadata.pins[this.pinIndex].dy,
        );
    }
}

class IntegratedCircuitDisplayImpl<T extends CircuitAPITypes> implements IntegratedCircuitDisplay {
    protected readonly id: GUID;

    protected readonly ctx: CircuitContext<T>;

    public constructor(ctx: CircuitContext<T>, id: GUID) {
        this.ctx = ctx;
        this.id = id;
    }

    protected get ic() {
        return this.ctx.internal.getICInfo(this.id).unwrap();
    }

    public set size(p: Vector) {
        this.ctx.internal.beginTransaction();
        this.ctx.internal.updateICMetadata(this.id, { displayWidth: p.x, displayHeight: p.y }).unwrap();
        this.ctx.internal.commitTransaction();
    }
    public get size(): Vector {
        return V(this.ic.metadata.displayWidth, this.ic.metadata.displayHeight);
    }
    public get pins(): ICPin[] {
        return this.ic.metadata.pins.map((_, i) => new IntegratedCircuitPinImpl(this.ctx, this.id, i));
    }
}

export class IntegratedCircuitImpl<T extends CircuitAPITypes> implements IntegratedCircuit {
    public readonly id: GUID;

    protected readonly ctx: CircuitContext<T>;

    public readonly display: IntegratedCircuitDisplay;

    public constructor(ctx: CircuitContext<T>, id: GUID) {
        this.ctx = ctx;
        this.id = id;

        this.display = new IntegratedCircuitDisplayImpl(ctx, id);
    }

    // Metadata
    public set name(name: string) {
        this.ctx.internal.beginTransaction();
        this.ctx.internal.updateICMetadata(this.id, { name }).unwrap();
        this.ctx.internal.commitTransaction();
    }
    public get name(): string {
        return this.ctx.internal.getICInfo(this.id).unwrap().metadata.name;
    }

    public get desc(): string {
        return this.ctx.internal.getICInfo(this.id).unwrap().metadata.desc;
    }

    public get all(): T["ObjContainerT"] {
        return this.ctx.factory.constructObjContainer(
            new Set(this.ctx.internal.getICInfo(this.id).unwrap().getObjs()),
            this.id
        );
    }

    public get components(): T["ReadonlyComponent[]"] {
        return [...this.ctx.internal.getICInfo(this.id).unwrap().getComponents()]
            .map((id) => this.ctx.factory.constructComponent(id, this.id));
    }
    public get wires(): T["ReadonlyWire[]"] {
        return [...this.ctx.internal.getICInfo(this.id).unwrap().getWires()]
            .map((id) => this.ctx.factory.constructWire(id, this.id));
    }
}
