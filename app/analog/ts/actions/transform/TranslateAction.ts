import {Vector} from "Vector";

import {GroupAction} from "../GroupAction";
import {Action} from "../Action";

import {EEComponent} from "analog/models/eeobjects/EEComponent";

export class TranslateAction implements Action {
    protected object: EEComponent;

    protected initialPosition: Vector;
    protected targetPosition: Vector;

    public constructor(object: EEComponent, targetPosition: Vector) {
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

export function CreateGroupTranslateAction(objs: Array<EEComponent>, targetPositions: Array<Vector>): GroupAction {
    return objs.reduce((acc, o, i) => {
        return acc.add(new TranslateAction(o, targetPositions[i]));
    }, new GroupAction());
}
