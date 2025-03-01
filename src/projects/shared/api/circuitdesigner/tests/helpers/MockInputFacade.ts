import {LEFT_MOUSE_BUTTON} from "shared/api/circuitdesigner/input/Constants";
import {Key} from "shared/api/circuitdesigner/input/Key";
import {Camera} from "shared/api/circuitdesigner/public/Camera";
import {V, Vector} from "Vector";


export class MockInputFacade {
    private readonly camera: Camera;
    private readonly canvas: HTMLCanvasElement;

    private touches: Vector[];
    private mousePos: Vector;

    public constructor(camera: Camera, canvas: HTMLCanvasElement) {
        this.camera = camera;
        this.canvas = canvas;

        this.touches = [];
        this.mousePos = V(0, 0);
    }

    private onMouseEv(type: string, pos: Vector, button: number) {
        this.mousePos = pos;  // Update mouse pos
        this.canvas.dispatchEvent(new MouseEvent(type, { clientX: pos.x, clientY: pos.y, button }));
    }
    private onScrollEv(deltaY: number) {
        this.canvas.dispatchEvent(new WheelEvent("wheel", { deltaY }));
    }
    private onTouchEv(type: string, touchPositions: Vector[]) {
        this.canvas.dispatchEvent(new TouchEvent(type, {
            touches: touchPositions.map((t) => ({ clientX: t.x, clientY: t.y } as Touch)),
        }));
    }

    public pressKey(code: Key): MockInputFacade {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: code }));
        return this;
    }
    public releaseKey(code: Key): MockInputFacade {
        window.dispatchEvent(new KeyboardEvent("keyup", { key: code }));
        return this;
    }

    public click(worldPos?: Vector, button: number = LEFT_MOUSE_BUTTON): MockInputFacade {
        const pos = (worldPos === undefined ? this.mousePos : this.camera.toScreenPos(worldPos));
        this.onMouseEv("mousedown", pos, button);
        this.onMouseEv("mouseup", pos, button);
        this.onMouseEv("click", pos, button);
        return this;
    }
    public doubleClick(button: number): MockInputFacade {
        this.onMouseEv("dblclick", this.mousePos, button);
        return this;
    }

    public scroll(delta: number): MockInputFacade {
        this.onScrollEv(delta);
        return this;
    }

    // Note that `pos` is in WORLD COORDINATES for testing purposes
    public press(worldPos?: Vector, button: number = LEFT_MOUSE_BUTTON): MockInputFacade {
        const pos = (worldPos === undefined ? this.mousePos : this.camera.toScreenPos(worldPos));
        this.onMouseEv("mousedown", pos, button);
        return this;
    }
    public move(amt: Vector, steps = 1, button: number = LEFT_MOUSE_BUTTON): MockInputFacade {
        const step = this.camera.toScreenPos(amt).sub(this.camera.toScreenPos(V())).scale(1 / steps);
        for (let i = 1; i <= steps; i++)
            this.onMouseEv("mousemove", this.mousePos.add(step), button);
        return this;
    }
    public moveTo(target: Vector, steps = 5, button: number = LEFT_MOUSE_BUTTON): MockInputFacade {
        // Calculate step Vector
        // Keep in world coordinates since we're passing to `move`
        const step = target.sub(this.camera.toWorldPos(this.mousePos)).scale(1 / steps);

        // Move a bit for each step
        for (let i = 1; i <= steps; i++)
            this.move(step, 1, button);

        return this;
    }
    public release(button: number = LEFT_MOUSE_BUTTON): MockInputFacade {
        this.onMouseEv("mouseup", this.mousePos, button);
        return this;
    }

    public drag(start: Vector, target: Vector, button: number = LEFT_MOUSE_BUTTON, steps = 5): MockInputFacade {
        this.press(start, button);
        this.moveTo(target, steps);
        this.release(button);
        return this;
    }

    public onMouseEnter(): MockInputFacade {
        this.onMouseEv("mouseenter", this.mousePos, LEFT_MOUSE_BUTTON);
        return this;
    }
    public onMouseLeave(): MockInputFacade {
        this.onMouseEv("mouseleave", this.mousePos, LEFT_MOUSE_BUTTON);
        return this;
    }

    public touch(pos: Vector): MockInputFacade {
        this.touches.push(this.camera.toScreenPos(pos));
        this.onTouchEv("touchstart", this.touches);
        return this;
    }
    public moveTouch(i: number, amt: Vector, steps = 1): MockInputFacade {
        const step = this.camera.toScreenPos(amt).sub(this.camera.toScreenPos(V())).scale(1 / steps);
        for (let s = 1; s <= steps; s++) {
            this.touches[i] = this.touches[i].add(step);
            this.onTouchEv("touchmove", this.touches);
        }
        return this;
    }
    public moveTouches(amt: Vector, steps = 1): MockInputFacade {
        const step = amt.scale(1 / steps);
        for (let i = 1; i <= steps; i++)
            this.touches.forEach((_, i) => this.moveTouch(i, step));
        return this;
    }
    public releaseTouch(i = 0): MockInputFacade {
        this.touches.splice(i, 1);
        this.onTouchEv("touchend", this.touches);
        return this;
    }

    public tap(pos: Vector): MockInputFacade {
        this.touch(pos);
        this.releaseTouch();
        this.onMouseEv("click", this.camera.toScreenPos(pos), LEFT_MOUSE_BUTTON);
        return this;
    }

    public onBlur(): MockInputFacade {
        window.dispatchEvent(new FocusEvent("blur", {}));
        return this;
    }

    public reset(): MockInputFacade {
        this.mousePos = V(0, 0);
        this.touches = [];
        return this;
    }
}
