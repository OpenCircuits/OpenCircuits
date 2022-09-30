import {ObjSet} from "core/utils/ObjSet";

import {DigitalComponent, DigitalObj, DigitalWire} from "core/models/types/digital";

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
export class DigitalObjSet extends ObjSet<DigitalObj> {
    public readonly inputs:  DigitalComponent[];
    public readonly outputs: DigitalComponent[];
    public readonly others:  DigitalComponent[];

    public constructor();
    public constructor(inputs: DigitalComponent[], outputs: DigitalComponent[],
                       others: DigitalComponent[], wires: DigitalWire[]);
    public constructor(inputs: DigitalComponent[] = [], outputs: DigitalComponent[] = [],
                       others: DigitalComponent[] = [], wires: DigitalWire[] = []) {
        super([...inputs, ...outputs, ...others, ...wires]);

        this.inputs = inputs;
        this.outputs = outputs;
        this.others = others;
    }

    public static From(set: DigitalObj[] = []): DigitalObjSet {
        const inputs  = [] as DigitalComponent[];
        const outputs = [] as DigitalComponent[];
        const others  = [] as DigitalComponent[];
        const wires   = set.filter((w) => (w.baseKind === "Wire")) as DigitalWire[];

        // Filter out inputs and outputs
        const objs = set.filter((o) => (o.baseKind === "Component")) as DigitalComponent[];
        for (const obj of objs) {
            // @TODO
            // // Input => >0 output ports and 0 input ports
            // if (obj.numInputs() === 0 && obj.numOutputs() > 0)
            //     inputs.push(obj);
            // // Output => >0 input ports and 0 output ports
            // else if (obj.numInputs() > 0 && obj.numOutputs() === 0)
            //     outputs.push(obj);
            // // Component => neither just input or output
            // else
            //     others.push(obj);
        }

        return new DigitalObjSet(inputs, outputs, others, wires);
    }
}
