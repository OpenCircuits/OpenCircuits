import {Vector} from "Vector";

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

        return this;
    }

}

export function CreateGroupTranslateAction(objs: Array<Component>, targetPositions: Array<Vector>): GroupAction {
    return objs.reduce((acc, o, i) => {
        return acc.add(new TranslateAction(o, targetPositions[i]));
    }, new GroupAction());
}
