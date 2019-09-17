import {Vector,V} from "math/Vector";
import {Transform} from "math/Transform";

import {EEObject} from "./EEObject"

export abstract class CullableObject extends EEObject {
    private cullTransform: Transform;

    constructor() {
        super();

        this.cullTransform = new Transform(V(), V());
    }

    private updateCullTransform(): void {
        // @TODO change this cause it's inefficient to
        //  recalculate the cull box if nothing has changed

        let min = this.getMinPos();
        let max = this.getMaxPos();

        this.cullTransform.setSize(max.sub(min));
        this.cullTransform.setPos(min.add(max).scale(0.5));
    }

    public getCullBox(): Transform {
        this.updateCullTransform();
        return this.cullTransform;
    }

	public copy(): CullableObject {
		let copy = <CullableObject>super.copy();
		copy.cullTransform = this.cullTransform.copy();
		return copy;
	}

    public abstract getMinPos(): Vector;
    public abstract getMaxPos(): Vector;

}
