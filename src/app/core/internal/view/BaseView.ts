import {DirtyVar} from "core/utils/DirtyVar";
import {Rect} from "math/Rect";
import {GUID} from "..";
import {RenderState} from "./rendering/RenderState";


export abstract class BaseView {
    protected readonly objID: GUID;
    protected readonly state: RenderState;

    protected cullTransform: DirtyVar<Rect>;

    public constructor(objID: GUID, state: RenderState) {
        this.objID = objID;
        this.state = state;

        this.cullTransform = new DirtyVar(() => this.getBounds());
    }

    protected get circuit() {
        return this.state.circuit;
    }
    protected get isSelected() {
        return this.state.selections.has(this.objID);
    }

    public render(): void {
        const { camera, renderer } = this.state;

        // TODO
        // // Check if we're on the screen
        // if (!camera.cull(this.cullTransform.get()))
        //     return;

        renderer.save();
        renderer.toWorldSpace();
        this.renderInternal();
        renderer.restore();
    }

    protected abstract renderInternal(): void;

    protected abstract getBounds(): Rect;
}
