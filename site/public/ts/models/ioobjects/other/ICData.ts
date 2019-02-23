
import {Vector,V} from "../../../utils/math/Vector";
import {Transform} from "../../../utils/math/Transform";

import {SeparatedComponentCollection,
        CopyGroup,
        CreateGraph,
        CreateGroup} from "../../../utils/ComponentUtils";

import {IOObject} from "../IOObject";

export class ICData {
    private transform: Transform;

    private collection: SeparatedComponentCollection;

    private inputPositions: Array<Vector>;
    private outputPositions: Array<Vector>;

    public constructor(collection: SeparatedComponentCollection) {
        this.transform = new Transform(V(0,0), V(0,0));
        this.collection = collection;
        this.inputPositions = [];
        this.outputPositions = [];

        this.calculateSize();
        this.positionPorts();
    }

    private calculateSize(): void {
        // Set start size based on length of names and amount of ports
        let longestName = 0;
        for (let obj of this.collection.inputs.concat(this.collection.outputs))
            longestName = Math.max(obj.getName().length, longestName);
        let w = DEFAULT_SIZE + 20*longestName;
        let h = DEFAULT_SIZE/2*(Math.max(this.collection.inputs.length, this.collection.outputs.length));
        this.transform.setSize(V(w, h));
    }

    private positionPorts(): void {
        // Set default positions for ports
        for (let i = 0; i < this.inputPositions.length; i++) {
            let l = -DEFAULT_SIZE/2*(i - (this.collection.inputs.length)/2 + 0.5);
            if (i === 0) l -= 1;
            if (i === this.collection.inputs.length-1) l += 1;
            let w = this.transform.getSize().x;
            this.inputPositions.push(V(-IO_PORT_LENGTH - (w/2 - DEFAULT_SIZE/2), l));
        }
        for (let i = 0; i < this.outputPositions.length; i++) {
            let l = -DEFAULT_SIZE/2*(i - (this.collection.outputs.length)/2 + 0.5);
            if (i === 0) l -= 1;
            if (i === this.collection.inputs.length-1) l += 1;
            let w = this.transform.getSize().x;
            this.outputPositions.push(V(IO_PORT_LENGTH + (w/2 - DEFAULT_SIZE/2), l));
        }
    }

    public getInputCount(): number {
        return this.collection.inputs.length;
    }

    public getOutputCount(): number {
        return this.collection.outputs.length;
    }

    public getSize(): Vector {
        return this.transform.getSize();
    }

    public getInputPos(i: number): Vector {
        return this.inputPositions[i];
    }

    public getOutputPos(i: number): Vector {
        return this.outputPositions[i];
    }

    public copy(): SeparatedComponentCollection {
        return CopyGroup(this.collection);
    }

    static IsValid(objects: Array<IOObject> | SeparatedComponentCollection): boolean {
        let group = (objects instanceof SeparatedComponentCollection) ? (objects) : (CreateGroup(objects));
        let graph = CreateGraph(group);

        // Make sure it's a connected circuit
        if (!graph.isConnected())
            return false;

        // Make sure it contains valid inputs (i.e. input w/ exactly 1 output)
        for (let input of group.inputs) {
            if (input.getOutputPortCount() != 1)
                return false;
        }
        // Make sure it contains valid outputs (i.e. output w/ exactly 1 input)
        for (let output of group.outputs) {
            if (output.getInputPortCount() != 1)
                return false;
        }

        return true;
    }

    static Create(objects: Array<IOObject>): ICData {
        let copies = CopyGroup(objects);
        if (!this.IsValid(copies))
            return undefined;

        return new ICData(copies);
    }
}
