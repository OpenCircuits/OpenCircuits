import {DEFAULT_SIZE} from "../../../utils/Constants";

import {V} from "../../../utils/math/Vector";
import {ClampedValue} from "../../../utils/ClampedValue";
import {SeparatedComponentCollection} from "../../../utils/ComponentUtils";
import {CircuitDesigner} from "../../CircuitDesigner";
import {Component} from "../Component";

import {ICData} from "./ICData";

export class IC extends Component {
    private data: ICData;

    private collection: SeparatedComponentCollection;

    public constructor(data: ICData) {
        super(new ClampedValue(data.getInputCount()),
              new ClampedValue(data.getOutputCount()), V(DEFAULT_SIZE, DEFAULT_SIZE));
        this.data = data;
        this.collection = this.data.copy(); // Copy internals

        // Redirect activate function for output objects
        for (let i = 0; i < this.getOutputPortCount(); i++) {
            let port = this.getOutputPort(i);
            let output = this.collection.outputs[i];
            output.activate = (on) => {
                port.activate(on);
            }
        }

        this.update();
    }

    private copyPorts(): void {
        let ports = this.data.getPorts();
        let myPorts = this.getPorts();

        // Copy names and positions of ports
        for (let i = 0; i < ports.length; i++) {
            myPorts[i].setName     (ports[i].getName());
            myPorts[i].setOriginPos(ports[i].getOriginPos());
            myPorts[i].setTargetPos(ports[i].getTargetPos());
        }
    }

    public setDesigner(designer?: CircuitDesigner): void {
        super.setDesigner(designer);

        // Set designer of all internal components/wires
        let components = this.collection.getAllComponents();
        for (let obj of components)
            obj.setDesigner(designer);
        for (let wire of this.collection.wires)
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
        for (let i = 0; i < this.getInputPortCount(); i++) {
            let port = this.getInputPort(i);
            let input = this.collection.inputs[i];
            input.activate(port.getIsOn());
        }
    }

    public copy(): IC {
        let copy = new IC(this.data);
        copy.transform = this.transform.copy();
        return copy;
    }

    public getDisplayName(): string {
        return "IC";
    }

    public getXMLName(): string {
        return "ic";
    }

    public getImageName(): string {
        return "";
    }

}
