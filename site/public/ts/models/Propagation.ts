import {IOObject} from "./ioobjects/IOObject";

export class Propagation {
	private receiver: IOObject;
	private signal: boolean;

	constructor(receiver: IOObject, signal: boolean) {
		this.receiver = receiver;
		this.signal = signal;
	}

	public send(): void {
		this.receiver.activate(this.signal);
	}

}
