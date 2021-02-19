import {serializable} from "serialeazy";

import {BCDtoDecimal} from "math/MathUtils";

import {IOObjectSet} from "core/utils/ComponentUtils";

import {IOObject} from "core/models/IOObject";

import {DigitalComponent, DigitalWire} from "digital/models/index";
import {InputPort} from "digital/models/ports/InputPort";
import {OutputPort} from "digital/models/ports/OutputPort";

/**
 * Helper class to hold different groups of components.
 *
 * The groups are:
 *  Input components  (anything with 0 output ports and >0  input ports)
 *  Output components (anything with 0 input ports  and >0 output ports)
 *  Wires             (wires)
 *  Other             (anything else)
 *
 * Note that .getComponents() does NOT contain wires
 *  A helper method to get all the components including them
 *  is included as toList()
 */
@serializable("DigitalObjectSet")
export class DigitalObjectSet extends IOObjectSet {
    private inputs:  DigitalComponent[];
    private outputs: DigitalComponent[];
    private others:  DigitalComponent[];

    public constructor(set: IOObject[] = []) {
        super(set);

        this.inputs  = [];
        this.outputs = [];
        this.others  = [];

        // Filter out inputs and outputs
        const objs = set.filter(o => o instanceof DigitalComponent) as DigitalComponent[];
        for (const obj of objs) {
            // Input => >0 output ports and 0 input ports
            if (obj.numInputs() === 0 && obj.numOutputs() > 0)
                this.inputs.push(obj);
            // Output => >0 input ports and 0 output ports
            else if (obj.numInputs() > 0 && obj.numOutputs() === 0)
                this.outputs.push(obj);
            // Component => neither just input or output
            else
                this.others.push(obj);
        }
    }

    // TODO: Remove, this is bad (ICData 228)
    public setInputs(inputs: DigitalComponent[]): void {
        this.inputs = inputs;
    }
    // TODO: Remove, this is bad (ICData 229)
    public setOthers(comps: DigitalComponent[]): void {
        this.others = comps;
    }

    public getWires(): DigitalWire[] {
        return Array.from(this.wires) as DigitalWire[];
    }

    public getInputs(): DigitalComponent[] {
        return this.inputs.slice(); // Shallow Copy
    }

    public getOutputs(): DigitalComponent[] {
        return this.outputs.slice(); // Shallow Copy
    }

    public getOthers(): DigitalComponent[] {
        return this.others.slice(); // Shallow Copy
    }

    public getComponents(): DigitalComponent[] {
        return this.inputs.concat(this.outputs, this.others);
    }
}

export function PortsToDecimal(ports: (InputPort | OutputPort)[]): number {
    return BCDtoDecimal(ports.map(p => p.getIsOn()));
}
