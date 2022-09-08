import {Vector} from "Vector";

import {SnapPos} from "core/utils/SnapUtils";

import {Action} from "core/actions/Action";

import {Component} from "core/models/Component";


/**
 * Translate can be applied to single components or groups of components,
 * used for moving componets from one position to another.
 */
class TranslateAction implements Action {

    /**
     * An array of the selected component(s).
     */
    protected objs: Component[];

    /**
     * An array of the starting position(s) of the selected component(s).
     */
    protected initialPositions: Vector[];

    /**
     * An array of the final position(s) of the selected component(s).
     */
    protected targetPositions: Vector[];

    /**
     * Flag that represents whether or not positions should be snapped.
     * Necessary to resolve issue #910.
     */
    protected snap: boolean;

    /**
     * Creates a translation of component(s) from one position to another.
     * Each component in objs list has corresponding initial position and target position in those
     * respective lists.
     *
     * @param objs            Initializes the array with the selected component(s).
     * @param targetPositions Initializes the array with the selected components' final positions.
     * @param snap            Sets whether or not components will snap. Defaults to true.
     */
    public constructor(objs: Component[], targetPositions: Vector[], snap = true) {
        this.objs = objs;

        this.initialPositions = objs.map((o) => o.getPos());
        this.targetPositions = targetPositions;
        this.snap = snap;

        this.execute();
    }

    /**
     * Moves object from the initial to target position, and snaps the wires accordingly.
     *
     * @returns An Action where the translation is executed.
     */
    public execute(): Action {
        this.objs.forEach((o, i) => o.setPos(this.targetPositions[i]));

        // Always snap afterwards to avoid issue #417
        if (this.snap)
            this.objs.forEach((o) => SnapPos(o));

        return this;
    }

    /**
     * Reverts a previous translation by moving component back to initial position.
     *
     * @returns An Action where the translation is undone.
     */
    public undo(): Action {
        this.objs.forEach((o, i) => o.setPos(this.initialPositions[i]));

        // Always snap afterwards to avoid issue #417
        if (this.snap)
            this.objs.forEach((o) => SnapPos(o));

        return this;
    }

    public getName(): string {
        return "Move Object";
    }

    public getCustomInfo(): string[] {
        return [...this.objs].map(
            (obj, i) => {
                const { x: ix, y: iy } = this.initialPositions[i];
                const { x: tx, y: ty } = this.targetPositions[i];
                return `${obj.getName()}: moved from (${ix.toFixed(2)}, ${iy.toFixed(2)})
                                                  to (${tx.toFixed(2)}, ${ty.toFixed(2)})`;
            }
        );
    }
}

export function Translate(objs: Component[], targetPositions: Vector[], snap = true) {
    return new TranslateAction(objs, targetPositions, snap);
}
