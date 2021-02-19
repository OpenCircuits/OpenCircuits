import {serializable, serialize} from "serialeazy";

import {DEFAULT_SIZE} from "core/utils/Constants";

import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {DigitalObjectSet} from "digital/utils/ComponentUtils";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {DigitalComponent} from "digital/models/DigitalComponent";

import {ICData} from "./ICData";


@serializable("IC", {
    customPostDeserialization: (obj: IC) => {
        obj.redirectOutputs();
    }
})
export class IC extends DigitalComponent {
    @serialize
    private data: ICData;

    @serialize
    private collection: DigitalObjectSet;

    public constructor(data?: ICData) {
        // If data if undefined (because we're deserealizing it, then use 0)
        super(new ClampedValue(data ? data.getInputCount()  : 0),
              new ClampedValue(data ? data.getOutputCount() : 0), V(DEFAULT_SIZE));
        if (!data)
            return;
        this.data = data;
        this.collection = this.data.copy(); // Copy internals

        this.redirectOutputs();
        this.update();
    }

    private redirectOutputs(): void {
        // Redirect activate function for output objects
        const outputs = this.collection.getOutputs();
        for (let i = 0; i < this.numOutputs(); i++) {
            const port = this.getOutputPort(i);
            const output = outputs[i];
            output.activate = (on) => {
                port.activate(on);
            }
        }
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

        // Set designer of all internal objects
        const objs = this.collection.getComponents();
        for (const obj of objs)
            obj.setDesigner(designer);
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

    public getData(): ICData {
        return this.data;
    }

    public getDisplayName(): string {
        return "IC";
    }
}
