import {V, Vector} from "Vector";

import {Transform} from "math/Transform";

import {IOObject} from "core/models/IOObject"
import {Prop}     from "core/models/PropInfo";


export abstract class CullableObject extends IOObject {
    private readonly cullTransform: Transform;

    private dirty: boolean;

    public constructor(initialProps: Record<string, Prop> = {}) {
        super(initialProps);

        this.dirty = true;
        this.cullTransform = new Transform(V(), V());
    }

    public onTransformChange(): void {
        this.dirty = true;
    }

    private updateCullTransform(): void {
        if (!this.dirty)
            return;
        this.dirty = false;

        const min = this.getMinPos();
        const max = this.getMaxPos();

        this.cullTransform.setSize(max.sub(min));
        this.cullTransform.setPos(min.add(max).scale(0.5));
    }

    public getCullBox(): Transform {
        this.updateCullTransform();
        return this.cullTransform;
    }

    public abstract getMinPos(): Vector;
    public abstract getMaxPos(): Vector;

}
