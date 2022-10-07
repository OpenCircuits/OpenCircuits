import {LEFT_MOUSE_BUTTON} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {Camera} from "math/Camera";

import {Input} from "core/utils/Input";
import {Key}   from "core/utils/Key";


export class FakeInput extends Input {
    private touches: Vector[];
    private readonly camera: Camera;

    public constructor(camera: Camera) {
        // Fake canvas and instant drag time
        super({
            addEventListener:      () => {},
            getBoundingClientRect: () => ({ left: 0, top: 0, width: camera.getSize().x, height: camera.getSize().y }),

            width: camera.getSize().x, height: camera.getSize().y,
        } as unknown as HTMLCanvasElement, -1);

        this.touches = [];
        this.camera = camera;
    }

    public pressKey(code: Key): FakeInput {
        super.onKeyDown(code);
        return this;
    }
    public releaseKey(code: Key): FakeInput {
        super.onKeyUp(code);
        return this;
    }

    public click(pos?: Vector, button: number = LEFT_MOUSE_BUTTON): FakeInput {
        pos = (pos === undefined ? super.getMousePos() : this.camera.getScreenPos(pos));
        super.onMouseDown(pos, button);
        super.onMouseUp(button);
        super.onClick(pos, button);
        return this;
    }
    public doubleClick(button: number): FakeInput {
        super.onDoubleClick(button);
        return this;
    }

    public scroll(delta: number): FakeInput {
        super.onScroll(delta);
        return this;
    }

    // Note that `pos` is in WORLD COORDINATES for testing purposes
    public press(pos?: Vector, button: number = LEFT_MOUSE_BUTTON): FakeInput {
        pos = (pos === undefined ? super.getMousePos() : this.camera.getScreenPos(pos));
        super.onMouseDown(pos, button);
        return this;
    }
    public move(amt: Vector, steps = 1): FakeInput {
        const step = this.camera.getScreenPos(amt).sub(this.camera.getScreenPos(V())).scale(1 / steps);
        for (let i = 1; i <= steps; i++)
            super.onMouseMove(super.getMousePos().add(step));
        return this;
    }
    public moveTo(target: Vector, steps = 5): FakeInput {
        // Calculate step Vector
        // Keep in world coordinates since we're passing to `move`
        const step = target.sub(this.camera.getWorldPos(this.getMousePos())).scale(1 / steps);

        // Move a bit for each step
        for (let i = 1; i <= steps; i++)
            this.move(step, 1);

        return this;
    }
    public release(button: number = LEFT_MOUSE_BUTTON): FakeInput {
        super.onMouseUp(button);
        return this;
    }

    public drag(start: Vector, target: Vector, button: number = LEFT_MOUSE_BUTTON, steps = 5): FakeInput {
        this.press(start, button);
        this.moveTo(target, steps);
        this.release(button);

        return this;
    }

    public override onMouseEnter(): FakeInput {
        super.onMouseEnter();
        return this;
    }
    public override onMouseLeave(): FakeInput {
        super.onMouseLeave();
        return this;
    }

    public touch(pos: Vector): FakeInput {
        this.touches.push(this.camera.getScreenPos(pos));
        super.onTouchStart(this.touches);
        return this;
    }
    public moveTouch(i: number, amt: Vector, steps = 1): FakeInput {
        const step = this.camera.getScreenPos(amt).sub(this.camera.getScreenPos(V())).scale(1 / steps);
        for (let s = 1; s <= steps; s++) {
            this.touches[i] = this.touches[i].add(step);
            super.onTouchMove(this.touches);
        }
        return this;
    }
    public moveTouches(amt: Vector, steps = 1): FakeInput {
        const step = amt.scale(1 / steps);
        for (let i = 1; i <= steps; i++)
            this.touches.forEach((_, i) => this.moveTouch(i, step));
        return this;
    }
    public releaseTouch(i = 0): FakeInput {
        super.onTouchEnd();
        this.touches.splice(i, 1);
        return this;
    }

    public tap(pos: Vector): FakeInput {
        this.touch(pos);
        this.releaseTouch();
        super.onClick(this.camera.getScreenPos(pos));
        return this;
    }

    public override onBlur(): FakeInput {
        super.onBlur();
        return this;
    }

    public override reset(): FakeInput {
        super.reset();
        this.touches = [];
        return this;
    }

}
