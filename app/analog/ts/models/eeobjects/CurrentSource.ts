import {V}     from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {EEComponent} from "./EEComponent";

export class CurrentSource extends EEComponent {

    public constructor(current: number = .005) {
        super(new ClampedValue(1), new ClampedValue(1), V(50, 50));
        //ensure no negative/zero current!!!
        if (current > 0){
            this.current = current;
        } else {
            this.current = .005;
        }

        this.inputs[0].setOriginPos(V(this.inputs[0].getOriginPos().y, -this.inputs[0].getOriginPos().x));
        this.inputs[0].setTargetPos(V(this.inputs[0].getTargetPos().y, -this.inputs[0].getTargetPos().x));

        this.outputs[0].setOriginPos(V(this.outputs[0].getOriginPos().y, -this.outputs[0].getOriginPos().x));
        this.outputs[0].setTargetPos(V(this.outputs[0].getTargetPos().y, -this.outputs[0].getTargetPos().x));
    }

    public getDisplayName(): string {
        return "CurrentSource";
    }

	public getImageName() {
		return "currentsource.svg";
	}

    public getXMLName(): string {
        return "cursource";
    }

}
