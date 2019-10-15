import {DEFAULT_SIZE} from "core/utils/Constants";

import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {DigitalObjectSet} from "digital/utils/ComponentUtils";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {DigitalComponent} from "digital/models/DigitalComponent";

import {ICData} from "./ICData";

export class IC extends DigitalComponent {
    private data: ICData;

    private collection: DigitalObjectSet;

    public constructor(data: ICData) {
        super(new ClampedValue(data.getInputCount()),
              new ClampedValue(data.getOutputCount()), V(DEFAULT_SIZE, DEFAULT_SIZE));
        this.data = data;
        this.collection = this.data.copy(); // Copy internals

        // Redirect activate function for output objects
        const outputs = this.collection.getOutputs();
        for (let i = 0; i < this.numOutputs(); i++) {
            const port = this.getOutputPort(i);
            const output = outputs[i];
            output.activate = (on) => {
                port.activate(on);
            }
        }

        this.update();
    }

    private copyPorts(): void {
        const ports = this.data.getPorts();
        const myPorts = this.getPorts();

        // Copy names and positions of ports
        for (let i = 0; i < ports.length; i++) {
            myPorts[i].setName     (ports[i].getName());
            myPorts[i].setOriginPos(ports[i].getOriginPos());
            myPorts[i].setTargetPos(ports[i].getTargetPos());
        }
    }

    public setDesigner(designer?: DigitalCircuitDesigner): void {
        super.setDesigner(designer);

        // Set designer of all internal components/wires
        const components = this.collection.getComponents();
        for (const obj of components)
            obj.setDesigner(designer);
        const wires = this.collection.getWires();
        for (const wire of wires)
            wire.setDesigner(designer);
    }

    public update(): void {
        // Update size
        this.transform.setSize(this.data.getSize());

        // Update port positions
        this.copyPorts();
    }

    public activate(): void {
        // Activate corresponding input object
        const inputs = this.collection.getInputs();
        for (let i = 0; i < this.numInputs(); i++) {
            const port = this.getInputPort(i);
            const input = inputs[i];
            input.activate(port.getIsOn());
        }
    }

    public copy(): IC {
        const copy = new IC(this.data);
        copy.transform = this.transform.copy();
        return copy;
    }

    public getData(): ICData {
        return this.data;
    }

    public getDisplayName(): string {
        return "IC";
    }

    public getXMLName(): string {
        return "ic";
    }
}
