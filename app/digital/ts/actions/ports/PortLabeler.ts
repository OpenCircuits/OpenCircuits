import {Multiplexer} from "digital/models/ioobjects/other/Multiplexer";
import {Encoder} from "digital/models/ioobjects/other/Encoder";
import {DigitalComponent} from "digital/models/DigitalComponent";

export class PortLabeler {
    protected obj: DigitalComponent;

    public constructor(obj: DigitalComponent) {
        this.obj = obj;
    }

    public setBinaryLabels(): void {
        console.log("PortLabeler setting labels!");
        const ports = (this.obj instanceof Multiplexer || this.obj instanceof Encoder) ?
            this.obj.getInputPorts() : this.obj.getOutputPorts();
        const digitCount = Math.log2(ports.length);
        let numStr = "0".repeat(digitCount);

        for (let i = 0; i < Math.pow(2, digitCount); i++) {
            ports[i].setName(numStr);
            numStr = (numStr.substr(0, numStr.lastIndexOf("0")) + "1").padEnd(digitCount, "0");
        }
    }
}