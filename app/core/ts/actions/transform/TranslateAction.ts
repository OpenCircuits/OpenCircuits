import {Vector} from "Vector";

import {WIRE_SNAP_THRESHOLD} from "core/utils/Constants";
import {Wire} from "core/models/Wire";

import {GroupAction} from "core/actions/GroupAction";
import {Action} from "core/actions/Action";

import {Component} from "core/models/Component";

export class TranslateAction implements Action {
    protected object: Component;

    protected initialPosition: Vector;
    protected targetPosition: Vector;

    public constructor(object: Component, targetPosition: Vector) {
        this.object = object;

        this.initialPosition = object.getPos();
        this.targetPosition = targetPosition;
    }

    public execute(): Action {
        this.object.setPos(this.targetPosition);

        return this;
    }

    public undo(): Action {
        this.object.setPos(this.initialPosition);
        SnapPos(this.object);
        return this;
    }

}

export function CreateGroupTranslateAction(objs: Array<Component>, targetPositions: Array<Vector>): GroupAction {
    return objs.reduce((acc, o, i) => {
        return acc.add(new TranslateAction(o, targetPositions[i]));
    }, new GroupAction());
}

function SnapPos(obj: Component): void {
    function DoSnap(wire: Wire, x: number, c: number): number {
        if (Math.abs(x - c) <= WIRE_SNAP_THRESHOLD) {
            wire.setIsStraight(true);
            return c;
        }
        return x;
    }

    const v = obj.getPos();
    // Snap to connections
    for (const port of obj.getPorts()) {
        const pos = port.getWorldTargetPos().sub(obj.getPos());
        const wires = port.getWires();
        for (const w of wires) {
            // Get the port that isn't the current port
            const port2 = (w.getP1() == port ? w.getP2() : w.getP1());
            w.setIsStraight(false);
            v.x = DoSnap(w, v.x + pos.x, port2.getWorldTargetPos().x) - pos.x;
            v.y = DoSnap(w, v.y + pos.y, port2.getWorldTargetPos().y) - pos.y;
        }
    }
    obj.setPos(v);
}
