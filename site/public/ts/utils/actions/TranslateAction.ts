import {Action} from "./Action";
import {Component} from "../../models/ioobjects/Component";
import {IOObject} from "../../models/ioobjects/IOObject";
import {Vector,V} from "../math/Vector";

export class TranslateAction implements Action {
    private offset: Vector;
    private objects: Array<IOObject>;

    public constructor(objects: Array<IOObject>) {
        this.offset = new Vector(0, 0);
        this.objects = objects;
    }

    public updateOffset(offset: Vector): void {
        let dOffset = offset.sub(this.offset);
        this.translateObjects(dOffset);
        this.offset = offset;
    }

    private translateObjects(offset: Vector): void {
        // Translate each object by a 'delta' pos
        for (let i = 0; i < this.objects.length; i++) {
            let obj = this.objects[i];
            // Only translate components
            if (obj instanceof Component)
                obj.setPos(obj.getPos().add(offset))
        }
    }

    public execute(): void {
        this.translateObjects(this.offset);
    }

    public undo(): void {
        this.translateObjects(this.offset.scale(-1));
    }

    public getOffset(): Vector {
        return this.offset;
    }
}
