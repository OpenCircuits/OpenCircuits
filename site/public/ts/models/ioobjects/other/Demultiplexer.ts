import {DEFAULT_SIZE,
		IO_PORT_LENGTH} from "../../../utils/Constants";
import {V} from "../../../utils/math/Vector";
import {Component} from "../Component";
import {ClampedValue} from "../../../utils/ClampedValue";
import {InputPort}from "../../../models/ioobjects/InputPort";
import {Port}from "../../../models/ioobjects/Port";

export class Demultiplexer extends Component {
	private selectLines: Array<InputPort>;

	public constructor() {
		super(new ClampedValue(2,1,9),new ClampedValue(2,1,8), V(0,0));
	}

	/**
	 * All ports are on the one side originally but
	 * 	this function overides the original UpdatePortPositions
	 * 	function and puts the correct number of inputs need at the
	 * 	bottom of the Demultiplexer
	 */
	public updatePortPositions(ports: Array<Port>) {
		// if input was zero or negative, demux would glitch
		if (!(ports[0] instanceof InputPort))
			super.updatePortPositions(ports);

		let target = this.inputs.length-1;
        let width = Math.max(DEFAULT_SIZE/2*(target-1), DEFAULT_SIZE);
        let height = DEFAULT_SIZE/2*(2 << (target-1));
        this.transform.setSize(V(width+10, height));

		this.selectLines = [];
        for (let i = 0; i < target; i++) {
            const input = this.inputs[i];
            this.selectLines.push(input);

            let l = -DEFAULT_SIZE/2*(i - target/2 + 0.5);
            if (i === 0) l -= 1;
            if (i === target-1) l += 1;

            input.setOriginPos(V(l, 0));
            input.setTargetPos(V(l, IO_PORT_LENGTH+height/2-DEFAULT_SIZE/2));
        }
        for (let i = 0; i < this.outputs.length; i++) {
            const output = this.outputs[i];

            let l = -DEFAULT_SIZE/2*(i - (this.outputs.length)/2 + 0.5);
            if (i === 0) l -= 1;
            if (i === this.outputs.length-1) l += 1;

            output.setOriginPos(V(0, l));
            output.setTargetPos(V(IO_PORT_LENGTH+(width/2-DEFAULT_SIZE/2), l));
        }
        const input = this.inputs[this.inputs.length-1];
        input.setOriginPos(V(0, 0));
        input.setTargetPos(V(-IO_PORT_LENGTH-(width/2-DEFAULT_SIZE/2), 0));
    }

    public activate() {
		let num = 0;
        for (let i = 0; i < this.selectLines.length; i++) {
            num = num | ((this.selectLines[i].getIsOn() ? 1 : 0) << i);
        }
		for (let i = 0; i < this.outputs.length; ++i){
			super.activate(false, i);
		}
        super.activate(this.inputs[this.inputs.length-1].getIsOn(), num);
    }

	public setInputPortCount(val: number) {
		super.setInputPortCount(val + 1);
	}

	public setOutputPortCount(val: number) {
		super.setOutputPortCount(2 << (val-1));
	}

	public getDisplayName(): string {
        return "Demultiplexer";
    }

	public getXMLName(): string {
        return "demux";
    }
}
