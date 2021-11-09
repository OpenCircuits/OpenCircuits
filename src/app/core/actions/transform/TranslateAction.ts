import {Vector} from "Vector";

import {Action} from "core/actions/Action";

import {Component} from "core/models/Component";

import {SnapPos} from "./SnapUtils";

/* 
 * Translate can be applied to single components or groups of components,
 * used for moving componets from one position to another.
 */
export class TranslateAction implements Action {
    protected objs: Component[];
    protected initialPositions: Vector[];
    protected targetPositions: Vector[];

    /*
     * Creates a translation of component(s) from one position to another.
     * Each component in objs list has corresponding initial position and target position in those
     * respective lists.
     */
    public constructor(objs: Component[], initialPositions: Vector[], targetPositions: Vector[]) {
        this.objs = objs;

        this.initialPositions = initialPositions;
        this.targetPositions = targetPositions;
    }

    /*
     * Moves object from the initial to target position, and snaps the wires accordingly.
     */
    public execute(): Action {
        this.objs.forEach((o, i) => o.setPos(this.targetPositions[i]));

        this.objs.forEach(o => SnapPos(o));

        return this;
    }

    /*
     * Reverts a previous translation by moving component back to initial position.
     */
    public undo(): Action {
        this.objs.forEach((o, i) => o.setPos(this.initialPositions[i]));

        this.objs.forEach(o => SnapPos(o));

        return this;
    }
}
