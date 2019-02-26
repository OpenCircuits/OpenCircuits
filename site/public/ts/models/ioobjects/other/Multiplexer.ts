import {DEFAULT_SIZE,
		IO_PORT_LENGTH} from "../../../utils/Constants";
import {V} from "../../../utils/math/Vector";
import {Component} from "../Component";
import {ClampedValue} from "../../../utils/ClampedValue";
import {InputPort}from "../../../models/ioobjects/InputPort";
import {Port}from "../../../models/ioobjects/Port";

//
//this is a Multiplexer class that takes
//in a certain number of inputs and has one  output
//

export class Multiplexer extends Component {
	private target: number;
	private selectLines: Array<InputPort>;

	//
	//clamps number of inputs and the output.
	//

	public constructor() {
		super(new ClampedValue(2,1,(Math.pow(2,8)+8)),new ClampedValue(1), V(0,0));
		this.target = 2;
	}

	//
	//Activate function that allows the multiplexer
	//to give desired output
	//

    public activate() {
		let num = 0;
		for (let i = 0; i < this.selectLines.length; i++)
			num = num | ((this.selectLines[i].getIsOn() ? 1 : 0) << i);
		super.activate(this.inputs[num + this.selectLines.length].getIsOn());
	}

	public getInputAmount() {
		return this.inputs.length;
	}

	public setInputPortCount(val: number) {
		this.target = val;
		super.setInputPortCount(val + (2 << (val-1)));
	}

	//
	//All ports are on the one side originally but
	// this function overides the original UpdatePortPositions
	//function and puts the correct number of inputs need at the
	// bottom of the multiplexer
	//

	public updatePortPositions(ports: Array<Port>) {
		//if ports is 0
		if (!(ports[0] instanceof InputPort))
			super.updatePortPositions(ports);

		//sets the width
        let width = Math.max(DEFAULT_SIZE/2*(this.target-1), DEFAULT_SIZE);
		//sets the height
        let height = DEFAULT_SIZE/2*(2 << (this.target-1));
        this.transform.setSize(V(width+10, height));

		//Manipulates the actual input ports
        this.selectLines = [];
        for (let i = 0; i < this.target; i++) {
            let input = this.inputs[i];
            this.selectLines.push(input);

            let l = -DEFAULT_SIZE/2*(i - this.target/2 + 0.5);
            if (i === 0) l -= 1;
            if (i === this.target-1) l += 1;
			//sets postition
            input.setOriginPos(V(l, 0));
            input.setTargetPos(V(l, IO_PORT_LENGTH+height/2-DEFAULT_SIZE/2));
        }
        for (let ii = this.target; ii < this.inputs.length; ii++) {
            let input = this.inputs[ii];

            let i = ii - this.target;

            let l = -DEFAULT_SIZE/2*(i - (this.inputs.length-this.target)/2 + 0.5);
            if (i === 0) l -= 1;
            if (i === this.inputs.length-this.target-1) l += 1;

            input.setOriginPos(V(0, l));
            input.setTargetPos(V(-IO_PORT_LENGTH-(width/2-DEFAULT_SIZE/2), l));
        }
    }

	public getImageName(): string {
		return "";
	}

	public getDisplayName(): string {
        return "Multiplexer";
    }

	public getXMLName(): string {
        return "mux";
    }

}
