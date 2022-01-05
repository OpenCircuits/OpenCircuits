import {LEFT_MOUSE_BUTTON} from "core/utils/Constants";

import {Vector, V} from "Vector";
import {Input} from "core/utils/Input";
import {Key} from "core/utils/Key";


export class FakeInput extends Input {
    private touches: Vector[];
    private center: Vector;

    public constructor(cameraCenter: Vector = V()) {
        // Fake canvas and instant drag time
        super({
            addEventListener: () => {},
            getBoundingClientRect: () => ({left: 0, top: 0, width: 1, height: 1}),
            width: 1, height: 1,
        } as any, -1);

        this.touches = [];
        this.center = cameraCenter;
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
        pos = (pos == undefined ? super.getMousePos() : pos.add(this.center));
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

    public press(pos?: Vector, button: number = LEFT_MOUSE_BUTTON): FakeInput {
        pos = (pos == undefined ? super.getMousePos() : pos.add(this.center));
        super.onMouseDown(pos, button);
        return this;
    }
    public move(amt: Vector, steps: number = 1): FakeInput {
        const step = amt.scale(1.0 / steps);
        for (let i = 1; i <= steps; i++)
            super.onMouseMove(super.getMousePos().add(step));
        return this;
    }
    public moveTo(target: Vector, steps: number = 5): FakeInput {
        // Calculate step Vector
        const pos = this.getMousePos();
        const step = target.add(this.center).sub(pos).scale(1.0 / steps);

        // Move a bit for each step
        for (let i = 1; i <= steps; i++)
            this.move(step);

        return this;
    }
    public release(button: number = LEFT_MOUSE_BUTTON): FakeInput {
        super.onMouseUp(button);
        return this;
    }

    public drag(start: Vector, target: Vector, button: number = LEFT_MOUSE_BUTTON, steps: number = 5): FakeInput {
        this.press(start, button);
        this.moveTo(target, steps);
        this.release(button);

        return this;
    }

    public onMouseEnter(): FakeInput {
        super.onMouseEnter();
        return this;
    }
    public onMouseLeave(): FakeInput {
        super.onMouseLeave();
        return this;
    }

    public touch(pos: Vector): FakeInput {
        this.touches.push(V(pos.add(this.center)));
        super.onTouchStart(this.touches);
        return this;
    }
    public moveTouch(i: number, amt: Vector, steps: number = 1): FakeInput {
        const step = amt.scale(1.0 / steps);
        for (let s = 1; s <= steps; s++) {
            this.touches[i] = this.touches[i].add(step);
            super.onTouchMove(this.touches);
        }
        return this;
    }
    public moveTouches(amt: Vector, steps: number = 1): FakeInput {
        const step = amt.scale(1.0 / steps);
        for (let i = 1; i <= steps; i++)
            this.touches.forEach((_, i) => this.moveTouch(i, step));
        return this;
    }
    public releaseTouch(i: number = 0): FakeInput {
        super.onTouchEnd();
        this.touches.splice(i, 1);
        return this;
    }

    public tap(pos: Vector): FakeInput {
        this.touch(pos);
        this.releaseTouch();
        super.onClick(pos.add(this.center));
        return this;
    }

    public onBlur(): FakeInput {
        super.onBlur();
        return this;
    }

    public reset(): FakeInput {
        super.reset();
        this.touches = [];
        return this;
    }

}
