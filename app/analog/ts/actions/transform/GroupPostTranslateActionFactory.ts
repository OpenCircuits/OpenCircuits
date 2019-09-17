import {Vector} from "Vector";

import {GroupAction} from "../GroupAction";
import {TranslateAction} from "./TranslateAction";

import {EEComponent} from "analog/models/eeobjects/EEComponent";

export function CreateGroupPostTranslateAction(objects: Array<EEComponent>, initialPositions: Array<Vector>): GroupAction {
    const action = new GroupAction();

    const finalPositions = objects.map((o) => o.getPos());

    // Reset to initial positons then make actions to set back to final
    objects.forEach((o, i) => o.setPos(initialPositions[i]));

    // Add actions
    objects.forEach((o, i) => action.add(new TranslateAction(o, finalPositions[i])));

    return action;
}
