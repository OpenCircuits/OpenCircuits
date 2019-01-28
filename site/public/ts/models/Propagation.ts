import {IOObject} from "./ioobjects/IOObject";

export class Propagation {
	receiver: IOObject;
	signal: boolean;

	constructor(receiver: IOObject, signal: boolean) {
		this.receiver = receiver;
		this.signal = signal;
	}

	send(): void {
		this.receiver.activate(this.signal);
	}

}
