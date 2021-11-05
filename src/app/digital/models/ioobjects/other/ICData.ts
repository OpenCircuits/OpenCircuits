import {DEFAULT_SIZE,
        IO_PORT_LENGTH} from "core/utils/Constants";

import {Vector, V} from "Vector";
import {Transform} from "math/Transform";

import {GetNearestPointOnRect} from "math/MathUtils";
import {serializable} from "serialeazy";

import {CopyGroup,
        CreateGraph,
        CreateGroup,
        IOObjectSet} from "core/utils/ComponentUtils";

import {DigitalObjectSet} from "digital/utils/ComponentUtils";

import {IOObject} from "core/models/IOObject";
import {Port} from "core/models/ports/Port";
import {InputPort} from "digital/models/ports/InputPort";
import {OutputPort} from "digital/models/ports/OutputPort";

import {Label} from "./Label";
import {Switch} from "../inputs/Switch";
import {Button} from "../inputs/Button";
import {SegmentDisplay} from "../outputs/SegmentDisplay";
import {Oscilloscope} from "../outputs/Oscilloscope";


@serializable("ICData")
export class ICData {
    private name: string;

    private transform: Transform;

    private collection: DigitalObjectSet;

    private inputPorts:  InputPort[];
    private outputPorts: OutputPort[];

    public constructor(collection?: DigitalObjectSet) {
        this.name = ""; // TODO: have names
        this.transform = new Transform(V(0,0), V(0,0));
        this.collection = collection;
        this.inputPorts  = [];
        this.outputPorts = [];

        if (collection) {
            this.calculateSize();
            this.createPorts(InputPort,  this.inputPorts,  this.collection.getInputs(), -1);
            this.createPorts(OutputPort, this.outputPorts, this.collection.getOutputs(), 1);
            this.positionPorts();
        }
    }

    private calculateSize(): void {
        const inputs  = this.collection.getInputs();
        const outputs = this.collection.getOutputs();

        // Set start size based on length of names and amount of ports
        let longestName = 0;
        for (const obj of inputs.concat(outputs))
            longestName = Math.max(obj.getName().length, longestName);
        longestName += this.getName().length; // Add name of IC

        const w = DEFAULT_SIZE + 15*longestName;
        const h = DEFAULT_SIZE/2*(Math.max(inputs.length, outputs.length));

        // Only set size if the current size is too small
        this.transform.setSize(V(w < this.getSize().x ? this.getSize().x : w,
                                 h < this.getSize().y ? this.getSize().y : h));
    }

    private createPorts(type: typeof InputPort | typeof OutputPort, ports: Array<Port>, arr: Array<IOObject>, side: -1 | 1): void {
        const w = this.transform.getSize().x;

        for (let i = 0; i < arr.length; i++) {
            const port = new type(undefined);

            let l = -DEFAULT_SIZE/2*(i - (arr.length)/2 + 0.5);
            if (i === 0) l -= 1;
            if (i === arr.length-1) l += 1;

            port.setName(arr[i].getName());
            port.setOriginPos(V(0, l));
            port.setTargetPos(V(side*(IO_PORT_LENGTH + (w/2 - DEFAULT_SIZE/2)), l));
            ports.push(port);
        }
    }

    public positionPorts(): void {
        const ports = this.getPorts();
        const size = this.transform.getSize();

        for (const port of ports) {
            // Scale by large number to make sure that the target position
            //  is not in the rectangle of the IC
            const target = this.transform.getMatrix().mul(port.getTargetPos());
            const origin = this.transform.getMatrix().mul(port.getOriginPos());
            const pos = target.add(target.sub(origin).normalize().scale(10000));

            const p = GetNearestPointOnRect(size.scale(-0.5), size.scale(0.5), pos);
            const v = p.sub(pos).normalize().scale(size.scale(0.5).sub(V(IO_PORT_LENGTH+size.x/2-0, IO_PORT_LENGTH+size.y/2-0))).add(p);

            port.setOriginPos(p);
            port.setTargetPos(v);
        }
    }

    public setName(name: string): void {
        this.name = name;
        this.calculateSize();
        this.positionPorts();
    }

    public setSize(v: Vector): void {
        this.transform.setSize(v);
    }

    public getName(): string {
        return this.name;
    }

    public getInputCount(): number {
        return this.collection.getInputs().length;
    }

    public getOutputCount(): number {
        return this.collection.getOutputs().length;
    }

    public getSize(): Vector {
        return this.transform.getSize();
    }

    public getInputPort(i: number): InputPort {
        return this.inputPorts[i];
    }

    public getOutputPort(i: number): OutputPort {
        return this.outputPorts[i];
    }

    public getPorts(): Array<Port> {
        let ports: Array<Port> = [];
        ports = ports.concat(this.inputPorts);
        ports = ports.concat(this.outputPorts);
        return ports;
    }

    public getGroup(): DigitalObjectSet {
        return this.collection;
    }

    public copy(): DigitalObjectSet {
        return new DigitalObjectSet(CopyGroup(this.collection.toList()).toList());
    }

    public static IsValid(objects: IOObject[] | DigitalObjectSet): boolean {
        const BLACKLIST = [SegmentDisplay, Oscilloscope];

        const group = (objects instanceof DigitalObjectSet) ? (objects) : (CreateGroup(objects));

        const objs  = group.getComponents();
        const wires = group.getWires();

        // Filter out the labels so that they don't make the graph 'disconnected'
        //  and we can still have labels within the IC (issue #555)
        const filteredGroup = new IOObjectSet((<IOObject[]>wires).concat(objs.filter(o => !(o instanceof Label))));
        const graph = CreateGraph(filteredGroup);

        // Make sure it's a connected circuit
        if (!graph.isConnected())
            return false;

        // Make sure there's nothing on the blacklist
        if (objs.some((o) => BLACKLIST.some((type) => o instanceof type)))
            return false;

        // Make sure all wires connected to components are in the group
        const allWires = objs.flatMap(o => o.getConnections());
        if (allWires.some((w) => !wires.includes(w)))
            return false;

        return true;
    }

    public static Create(objects: IOObject[]): ICData {
        const copies = new DigitalObjectSet(CopyGroup(objects).toList());
        if (!this.IsValid(copies))
            return undefined;

        // // Set designer of copies to null
        // copies.toList().forEach((obj) => obj.setDesigner(undefined));

        // Move non-whitelisted inputs to regular components list
        //  So that the ports that come out of the IC are useful inputs and not
        //  things like ConstantHigh and ConstantLow which aren't interactive
        const INPUT_WHITELIST = [Switch, Button];

        const inputs = copies.getInputs().filter((i) => INPUT_WHITELIST.some((type) => i instanceof type));
        const others = copies.getOthers().concat(copies.getInputs())
                .filter((c) => !INPUT_WHITELIST.some((type) => c instanceof type));

        copies.setInputs(inputs);
        copies.setOthers(others);

        return new ICData(copies);
    }
}
