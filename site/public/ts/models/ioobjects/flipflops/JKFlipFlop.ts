import {V} from "../../../utils/math/Vector";
import {FlipFlop} from "./FlipFlop";
import {Port} from "../Port";

export class JKFlipFlop extends FlipFlop {

	public constructor() {
		super(3, V(80, 120));
		this.getInputPort(0).setName("K");
		this.getInputPort(1).setName(">");
		this.getInputPort(2).setName("J");
	}

	// @Override
	public activate() {
		this.last_clock = this.clock;
		this.clock = this.inputs[1].getIsOn();
		const set = this.inputs[0].getIsOn();
		const reset = this.inputs[2].getIsOn();
		if (this.clock && !this.last_clock) {
			if (set && reset) {
				this.state = !this.state;
			} else if (set) {
				this.state = true;
			} else if (reset) {
				this.state = false;
			}
		}

		super.activate(this.state, 0);
		super.activate(!this.state, 1);
	}

	// @Override
	protected updatePortPositions(arr: Array<Port>): void {
        for (let i = 0; i < arr.length; i++) {
            // Calculate y position of port
            let l = -this.transform.getSize().y/2*(i - arr.length/2 + 0.5);
            if (i === 0) l--;
            if (i === arr.length-1) l++;

            // Set y positions
            let port = arr[i];
            l *= 3/4;
            port.setOriginPos(V(port.getOriginPos().x, l));
            port.setTargetPos(V(port.getTargetPos().x, l));
        }
    }

	public getDisplayName() {
		return "JK Flip Flop";
	}

	public getXMLName(): string {
		return "jkff";
	}
}
