import {V, Vector} from "Vector";
import {Clamp}     from "math/MathUtils";

import {ObservableImpl} from "shared/api/circuit/utils/Observable";
import {CircuitState, CircuitTypes} from "shared/api/circuit/public/impl/CircuitState";


import {Camera, CameraEvent} from "../Camera";


export const MIN_ZOOM = 1e-6;
export const MAX_ZOOM = 200;

export class CameraImpl<T extends CircuitTypes> extends ObservableImpl<CameraEvent> implements Camera {
    protected readonly state: CircuitState<T>;

    public constructor(state: CircuitState<T>) {
        super();

        this.state = state;
    }

    protected get internal() {
        return this.state.internal;
    }

    public set cx(x: number) {
        const cam = this.internal.getCamera();
        const dx = (cam.x - x);

        // No change, do nothing
        if (dx === 0)
            return;

        this.internal.setCamera({ x });
        this.publish({ type: "change", dx, dy: 0, dz: 0 });
    }
    public get cx(): number {
        return this.internal.getCamera().x;
    }
    public set cy(y: number) {
        const cam = this.internal.getCamera();
        const dy = (cam.y - y);

        // No change, do nothing
        if (dy === 0)
            return;

        this.internal.setCamera({ y });
        this.publish({ type: "change", dx: 0, dy, dz: 0 });
    }
    public get cy(): number {
        return this.internal.getCamera().y;
    }
    public set pos({ x, y }: Vector) {
        const cam = this.internal.getCamera();
        const dx = (cam.x - x), dy = (cam.y - y);

        // No change, do nothing
        if (dx === 0 && dy === 0)
            return;

        this.internal.setCamera({ x, y });
        this.publish({ type: "change", dx, dy, dz: 0 });
    }
    public get pos(): Vector {
        const camera = this.internal.getCamera();

        return V(camera.x, camera.y);
    }

    public set zoom(z: number) {
        const zoom = Clamp(z, MIN_ZOOM, MAX_ZOOM);

        const cam = this.internal.getCamera();
        const dz = (cam.zoom - zoom);

        // No change, do nothing
        if (dz === 0)
            return;

        this.internal.setCamera({ zoom });
        this.publish({ type: "change", dx: 0, dy: 0, dz: dz });
    }
    public get zoom(): number {
        return this.internal.getCamera().zoom;
    }

    public translate(delta: Vector): void {
        this.pos = this.pos.add(delta);
    }

    public zoomTo(dz: number, pos: Vector): void {
        this.zoom *= dz;
        this.translate(pos.sub(this.pos).scale(1 - dz));
    }
}
