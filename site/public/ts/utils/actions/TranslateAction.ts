import {Vector} from "../math/Vector";

import {Action} from "./Action";
import {Component} from "../../models/ioobjects/Component";

export class TranslateAction implements Action {
    private objects: Array<Component>;

    private initialPositions: Array<Vector>;
    private finalPositions: Array<Vector>;

    public constructor(objects: Array<Component>, initialPositions: Array<Vector>, finalPositions: Array<Vector>) {
        this.objects = objects;
        this.initialPositions = initialPositions;
        this.finalPositions = finalPositions;
    }

    private setPositions(positions: Array<Vector>): void {
        for (let i = 0; i < this.objects.length; i++) {
            const obj = this.objects[i];
            obj.setPos(positions[i]);
        }
    }

    public execute(): Action {
        this.setPositions(this.finalPositions);

        return this;
    }

    public undo(): Action {
        this.setPositions(this.initialPositions);

        return this;
    }

}
