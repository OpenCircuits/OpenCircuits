import {Vector} from "Vector";

import {Action} from "core/actions/Action";

import {Component} from "core/models/Component";

import {SnapPos} from "./SnapUtils";


/**
 * Translate can be applied to single components or groups of components,
 * used for moving componets from one position to another.
 */
export class TranslateAction implements Action {

    /**
     * An array of the selected component(s)
     */
    protected objs: Component[];

    /**
     * An array of the starting position(s) of the selected component(s)
     */
    protected initialPositions: Vector[];

    /**
     * An array of the final position(s) of the selected component(s)
     */
    protected targetPositions: Vector[];

    /**
     * Flag that represents whether or not positions should be snapped.
     * Necessary to resolve issue #910
     */
    protected snap: boolean;

    /**
     * Creates a translation of component(s) from one position to another.
     * Each component in objs list has corresponding initial position and target position in those
     * respective lists.
     *
     * @param objs Initializes the array with the selected component(s)
     * @param initialPositions Initializes the array with the selected components' starting positions
     * @param targetPositions Initializes the array with the selected components' final positions
     * @param snap Sets whether or not components will snap. Defaults to true.
     */
    public constructor(objs: Component[], initialPositions: Vector[], targetPositions: Vector[], snap = true) {
        this.objs = objs;

        this.initialPositions = initialPositions;
        this.targetPositions = targetPositions;
        this.snap = snap;
    }

    /**
     * Moves object from the initial to target position, and snaps the wires accordingly.
     *
     * @returns an Action where the translation is executed
     */
    public execute(): Action {
        this.objs.forEach((o, i) => o.setPos(this.targetPositions[i]));

        // Always snap afterwards to avoid issue #417
        if (this.snap)
            this.objs.forEach(o => SnapPos(o));

        return this;
    }

    /**
     * Reverts a previous translation by moving component back to initial position.
     *
     * @returns an Action where the translation is undone
     */
    public undo(): Action {
        this.objs.forEach((o, i) => o.setPos(this.initialPositions[i]));

        // Always snap afterwards to avoid issue #417
        if (this.snap)
            this.objs.forEach(o => SnapPos(o));

        return this;
    }

    public getName(): string {
        return "Move Object";
    }

    public getCustomInfo(): string[] {
        return Array.from(
            this.objs, (obj, i) =>
                `${obj.getName()}: moved from (${this.initialPositions[i].x.toFixed(2)}, ${this.initialPositions[i].y.toFixed(2)})
                                            to (${this.targetPositions[i].x.toFixed(2)}, ${this.targetPositions[i].y.toFixed(2)})`
        )
    }
}
