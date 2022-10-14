import {Vector} from "Vector";

import {Camera}    from "math/Camera";
import {Rect}      from "math/Rect";
import {Transform} from "math/Transform";

import {DirtyVar}          from "core/utils/DirtyVar";
import {SelectionsWrapper} from "core/utils/SelectionsWrapper";

import {Renderer} from "core/utils/rendering/Renderer";

import {AnyObj} from "core/models/types";

import {CircuitController} from "core/controllers/CircuitController";


export type ViewCircuitInfo<Circuit extends CircuitController<AnyObj>> = {
    circuit: Circuit;
}

export type RenderInfo = {
    camera: Camera;
    renderer: Renderer;
    selections: SelectionsWrapper;
}

/**
 * The premise for a View instance is that it contains *entirely* and *uniquely* **computed** values
 *  from the encapsulated model. This is things like the port positions for objects like ANDGates
 *  which are set automatically. This would also be things for efficiency purposes like transform
 *  matrices and bezier curve bounds and such.
 */
export abstract class BaseView<
    Obj extends AnyObj,
    Info extends ViewCircuitInfo<CircuitController<AnyObj>> = ViewCircuitInfo<CircuitController<AnyObj>>,
> {
    protected readonly info: Info;
    protected readonly circuit: Info["circuit"];
    protected readonly obj: Obj;

    protected cullTransform: DirtyVar<Transform>;

    public constructor(info: Info, obj: Obj) {
        this.info = info;
        this.circuit = info.circuit;
        this.obj = obj;
        this.cullTransform = new DirtyVar(
            () => Transform.FromRect(this.getBounds()),
        );
    }

    public onPropChange(propKey: string): void {
        if (["x", "y", "angle"].includes(propKey))
            this.cullTransform.setDirty();
    }

    public abstract contains(pt: Vector): boolean;
    public abstract isWithinBounds(bounds: Transform): boolean;

    public render(info: RenderInfo): void {
        const { camera, renderer } = info;

        // Check if we're on the screen
        if (!camera.cull(this.cullTransform.get()))
            return;

        renderer.save();
        renderer.transform(camera);
        this.renderInternal(info);
        renderer.restore();
    }

    protected abstract renderInternal(info: RenderInfo): void;

    protected abstract getBounds(): Rect;

    public abstract getMidpoint(): Vector;

    public getObj(): Obj {
        return this.obj;
    }

    public getCullbox(): Transform {
        return this.cullTransform.get();
    }

    public getLayer(): number {
        return 0;
    }
}
