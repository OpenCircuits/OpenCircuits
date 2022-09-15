import {serializable, serialize} from "serialeazy";

import {V} from "Vector";

import {ClampedValue} from "math/ClampedValue";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {DigitalComponent}       from "digital/models/DigitalComponent";
import {DigitalObjectSet}       from "digital/models/DigitalObjectSet";

import {ICData} from "./ICData";


@serializable("IC", {
    customPostDeserialization: (obj: IC) => {
        obj.redirectOutputs();
    },
})
export class IC extends DigitalComponent {
    @serialize
    private data: ICData;

    @serialize
    private readonly collection: DigitalObjectSet;

    public constructor(data?: ICData) {
        // If data if undefined (because we're deserealizing it, then use 0)
        super(new ClampedValue(data ? data.getInputCount()  : 0),
              new ClampedValue(data ? data.getOutputCount() : 0), V(1));
        if (!data)
            return;
        this.data = data;
        this.collection = this.data.copy(); // Copy internals

        this.updateInputs();
        this.redirectOutputs();
        this.update();
    }

    private updateInputs(): void {
        // Set all ports to match the signal of the associated input (issue #468)
        this.collection.getInputs().forEach((input, i) =>
            this.getInputPort(i).activate(input.getOutputPort(0).getIsOn())
        );
    }

    private redirectOutputs(): void {
        // Redirect activate function for output objects
        this.collection.getOutputs().forEach((output, i) => {
            const port = this.getOutputPort(i);
            // Activate port to same as output (issue #468)
            port.activate(output.getInputPort(0).getIsOn());
            output.activate = (on) => {
                port.activate(on);
            }
        });
    }

    private copyPorts(): void {
        const ports = this.data.getPorts();
        const myPorts = this.getPorts();

        // Copy names and positions of ports
        for (const [i, port] of ports.entries()) {
            myPorts[i].setName     (port.getName());
            myPorts[i].setOriginPos(port.getOriginPos());
            myPorts[i].setTargetPos(port.getTargetPos());
        }
    }

    public override setDesigner(designer?: DigitalCircuitDesigner): void {
        super.setDesigner(designer);

        // Set designer of all internal objects
        const objs = this.collection.getComponents();
        for (const obj of objs)
            obj.setDesigner(designer);
    }

    public update(): void {
        // Update size
        this.setSize(this.data.getSize());

        // Update port positions
        this.copyPorts();

        // Update cullbox
        this.onTransformChange();
    }

    public override activate(): void {
        // Activate corresponding input object
        this.collection.getInputs().forEach((input, i) =>
            input.activate(this.getInputPort(i).getIsOn())
        );
    }

    public setData(data: ICData) {
        this.data = data;
    }

    public getData(): ICData {
        return this.data;
    }

    public getCollection(): DigitalObjectSet {
        return this.collection;
    }

    public getDisplayName(): string {
        return "IC";
    }
}
