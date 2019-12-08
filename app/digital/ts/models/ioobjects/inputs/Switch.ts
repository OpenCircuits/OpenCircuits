import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {PressableComponent} from "../PressableComponent";
import {serializable} from "serialeazy";

@serializable("Switch")
export class Switch extends PressableComponent {

    public constructor() {
        super(new ClampedValue(0),
              new ClampedValue(1),
              V(62, 77),
              V(48, 60));
    }

    public click(): void {
        this.activate(!this.on);
    }

    public activate(signal: boolean): void {
        super.activate(signal, 0);
    }

    public getDisplayName(): string {
        return "Switch";
    }

    public getOffImageName(): string {
        return "switchUp.svg";
    }

    public getOnImageName(): string {
        return "switchDown.svg";
    }
}
