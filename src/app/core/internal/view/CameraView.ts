import {DirtyVar} from "core/utils/DirtyVar";
import {Matrix2x3} from "math/Matrix";
import {V, Vector} from "Vector";
import {CircuitInternal} from "../impl/CircuitInternal";


export class CameraView {
    protected circuit: CircuitInternal;

    private mat: DirtyVar<Matrix2x3>;

    private screenSize: Vector;
    
    public constructor(circuit: CircuitInternal) {
        this.circuit = circuit;

        this.mat = new DirtyVar(() => new Matrix2x3(this.pos, 0, this.scale));
        this.screenSize = V();
    }

    private get cam() {
        return this.circuit.getCamera();
    }

    public setDirty() {
        this.mat.setDirty();
    }

    public resize(w: number, h: number) {
        this.screenSize = V(w, h);
    }

    public toWorldPos(pos: Vector): Vector {
        return this.matrix.mul(pos.sub(this.screenSize.scale(0.5)));
    }
    public toScreenPos(pos: Vector): Vector {
        return this.matrix.inverse().mul(pos).add(this.screenSize.scale(0.5));
    }

    public get matrix(): Matrix2x3 {
        return this.mat.get();
    }

    public get pos(): Vector {
        return V(this.cam.x, this.cam.y);
    }

    public get zoom(): number {
        return this.cam.zoom;
    }

    public get scale(): Vector {
        return V(this.zoom, -this.zoom);
    }
}
