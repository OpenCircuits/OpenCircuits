import {GRID_SIZE} from "../Constants";
import {Vector,V} from "../math/Vector";

import {Action} from "./Action";
import {Component} from "../../models/ioobjects/Component";
import {IOObject} from "../../models/ioobjects/IOObject";

export class TranslateAction implements Action {
    private offset: Vector;
    private objects: Array<IOObject>;
    private initialComponent: IOObject;

    public constructor(objects: Array<IOObject>, initialComponent: IOObject) {
        this.offset = new Vector(0, 0);
        this.objects = objects;
        this.initialComponent = initialComponent;
    }

    public updateOffset(offset: Vector, shift: boolean): void {
        let dOffset = offset.sub(this.offset);
        if (this.initialComponent instanceof Component)
            dOffset = offset.sub(this.initialComponent.getPos())

        this.translateObjects(dOffset, shift);
        this.offset = offset;
    }

    private translateObjects(offset: Vector, shift: boolean): void {
        // Translate each object by a 'delta' pos
        for (let i = 0; i < this.objects.length; i++) {
            let obj = this.objects[i];
            // Only translate components
            if (obj instanceof Component) {
                let newPos = obj.getPos().add(offset);
                if (shift) {
                    newPos = V(Math.floor(newPos.x/GRID_SIZE+0.5)*GRID_SIZE,
                               Math.floor(newPos.y/GRID_SIZE+0.5)*GRID_SIZE);
                }
                obj.setPos(newPos);
            }
        }
    }

    public execute(): void {
        this.translateObjects(this.offset, false);
    }

    public undo(): void {
        this.translateObjects(this.offset.scale(-1), false);
    }

    public getOffset(): Vector {
        return this.offset;
    }
}
