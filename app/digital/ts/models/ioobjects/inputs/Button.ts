import {Vector, V} from "Vector";
import {CircleContains} from "math/MathUtils";
import {ClampedValue} from "math/ClampedValue";

import {PressableComponent} from "../PressableComponent";
import {serializable} from "serialeazy";

@serializable("Button")
export class Button extends PressableComponent {
    public constructor() {
        super(new ClampedValue(0),
              new ClampedValue(1),
              V(50, 50),
              V(50, 50));
    }

    public isWithinPressBounds(v: Vector): boolean {
        return CircleContains(this.getPos(), this.getSize().x/2, v);
    }

    public press(): void {
        this.activate(true);
    }

    public release(): void {
        this.activate(false);
    }

    public activate(signal: boolean): void {
        super.activate(signal, 0);
    }

    public getDisplayName(): string {
        return "Button";
    }

    public getOffImageName(): string {
        return "buttonUp.svg";
    }

    public getOnImageName(): string {
        return "buttonDown.svg";
    }
}
