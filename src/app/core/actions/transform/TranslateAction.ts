import {Vector} from "Vector";

import {Action} from "core/actions/Action";

import {Component} from "core/models/Component";

import {SnapPos} from "./SnapUtils";

// Translate can be applied to single components,
//  but if you need to translate multiple components at
//  once you MUST do it as a group to avoid the issue #417
//  https://github.com/OpenCircuits/OpenCircuits/issues/417
export class TranslateAction implements Action {
    protected objs: Component[];
    protected initialPositions: Vector[];
    protected targetPositions: Vector[];

    public constructor(objs: Component[], initialPositions: Vector[], targetPositions: Vector[]) {
        this.objs = objs;

        this.initialPositions = initialPositions;
        this.targetPositions = targetPositions;
    }

    public execute(): Action {
        this.objs.forEach((o, i) => o.setPos(this.targetPositions[i]));

        // Always snap afterwards to avoid issue #417
        this.objs.forEach(o => SnapPos(o));

        return this;
    }

    public undo(): Action {
        this.objs.forEach((o, i) => o.setPos(this.initialPositions[i]));

        // Always snap afterwards to avoid issue #417
        this.objs.forEach(o => SnapPos(o));

        return this;
    }
}
