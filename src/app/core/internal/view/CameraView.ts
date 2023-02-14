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

    public resize(w: number, h: number) {
        this.screenSize = V(w, h);
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
