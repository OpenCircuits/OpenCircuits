import {serializable} from "serialeazy";

import {IOObjectSet} from "core/utils/ComponentUtils";

import {IOObject, Wire} from "core/models";

import {DigitalComponent, DigitalWire} from "./index";

/**
 * Helper class to hold different groups of components.
 *
 * The groups are:
 *  Input components  (anything with 0 output ports and >0  input ports).
 *  Output components (anything with 0 input ports  and >0 output ports).
 *  Wires             (wires).
 *  Other             (anything else).
 *
 * Note that .getComponents() does NOT contain wires
 *  A helper method to get all the components including them
 *  is included as toList().
 */
@serializable("DigitalObjectSet")
export class DigitalObjectSet extends IOObjectSet {
    private readonly inputs:  DigitalComponent[];
    private readonly outputs: DigitalComponent[];
    private readonly others:  DigitalComponent[];

    public constructor();
    public constructor(inputs: DigitalComponent[], outputs: DigitalComponent[],
                       others: DigitalComponent[], wires: Wire[]);
    public constructor(inputs: DigitalComponent[] = [], outputs: DigitalComponent[] = [],
                       others: DigitalComponent[] = [], wires: Wire[] = []) {
        super([...inputs, ...outputs, ...others, ...wires]);

        this.inputs = inputs;
        this.outputs = outputs;
        this.others = others;
    }

    public getInputs(): DigitalComponent[] {
        return [...this.inputs]; // Shallow Copy
    }

    public getOutputs(): DigitalComponent[] {
        return [...this.outputs]; // Shallow Copy
    }

    public getOthers(): DigitalComponent[] {
        return [...this.others]; // Shallow Copy
    }

    public override getWires(): DigitalWire[] {
        return [...this.wires] as DigitalWire[];
    }

    public override getComponents(): DigitalComponent[] {
        return [...this.inputs, ...this.outputs, ...this.others];
    }

    public static From(set: IOObject[] = []): DigitalObjectSet {
        const inputs  = [] as DigitalComponent[];
        const outputs = [] as DigitalComponent[];
        const others  = [] as DigitalComponent[];
        const wires   = set.filter((w) => w instanceof Wire) as Wire[];

        // Filter out inputs and outputs
        const objs = set.filter((o) => o instanceof DigitalComponent) as DigitalComponent[];
        for (const obj of objs) {
            // Input => >0 output ports and 0 input ports
            if (obj.numInputs() === 0 && obj.numOutputs() > 0)
                inputs.push(obj);
            // Output => >0 input ports and 0 output ports
            else if (obj.numInputs() > 0 && obj.numOutputs() === 0)
                outputs.push(obj);
            // Component => neither just input or output
            else
                others.push(obj);
        }

        return new DigitalObjectSet(inputs, outputs, others, wires);
    }
}
