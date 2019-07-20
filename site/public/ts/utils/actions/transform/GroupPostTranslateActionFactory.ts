import {Vector} from "../../math/Vector";

import {GroupAction} from "../GroupAction";
import {TranslateAction} from "./TranslateAction";

import {Component} from "../../../models/ioobjects/Component";

export function CreateGroupPostTranslateAction(objects: Array<Component>, initialPositions: Array<Vector>): GroupAction {
    const action = new GroupAction();

    const finalPositions = objects.map((o) => o.getPos());

    // Reset to initial positons then make actions to set back to final
    objects.forEach((o, i) => o.setPos(initialPositions[i]));

    // Add actions
    objects.forEach((o, i) => action.add(new TranslateAction(o, finalPositions[i])));

    return action;
}
