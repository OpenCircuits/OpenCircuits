import {serializable} from "serialeazy";

import {GRID_SIZE,
        IO_PORT_LENGTH} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {GetNearestPointOnRect} from "math/MathUtils";
import {Transform}             from "math/Transform";

import {CopyGroup,
        CreateGroup} from "core/utils/ComponentUtils";

import {Component} from "core/models/Component";
import {IOObject}  from "core/models/IOObject";

import {Port} from "core/models/ports/Port";

import {DigitalObjectSet} from "digital/models/DigitalObjectSet";

import {Button} from "digital/models/ioobjects/inputs/Button";
import {Switch} from "digital/models/ioobjects/inputs/Switch";

import {LED}            from "digital/models/ioobjects/outputs/LED";
import {Oscilloscope}   from "digital/models/ioobjects/outputs/Oscilloscope";
import {SegmentDisplay} from "digital/models/ioobjects/outputs/SegmentDisplay";

import {InputPort}  from "digital/models/ports/InputPort";
import {OutputPort} from "digital/models/ports/OutputPort";


@serializable("ICData")
export class ICData {
    private name: string;

    private readonly transform: Transform;

    private readonly collection: DigitalObjectSet;

    private readonly inputPorts:  InputPort[];
    private readonly outputPorts: OutputPort[];

    /**
     * The sole constructor for ICData, it is recommended to use the Create function instead.
     *
     * @param collection The circuit to create an instance of ICData of.
     */
    public constructor(collection?: DigitalObjectSet) {
        this.name = ""; // TODO: have names
        this.transform = new Transform(V(0,0), V(0,0));
        this.collection = collection!;
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
        for (const obj of [...inputs, ...outputs])
            longestName = Math.max(obj.getName().length, longestName);
        longestName += this.getName().length; // Add name of IC

        const w = 1 + 0.3*longestName;
        const h = Math.max(inputs.length, outputs.length)/2;

        // Only set size if the current size is too small
        this.transform.setSize(Vector.Max(V(w, h), this.getSize()));
    }

    private createPorts(type: typeof InputPort | typeof OutputPort, ports: Port[], arr: IOObject[], side: -1 | 1) {
        const w = this.transform.getSize().x;

        for (let i = 0; i < arr.length; i++) {
            const port = new type(undefined);

            let l = -(i - (arr.length)/2 + 0.5)/2;
            if (i === 0)
                l -= 0.02;
            if (i === arr.length-1)
                l += 0.02;

            port.setName(arr[i].getName());
            port.setOriginPos(V(0, l));
            port.setTargetPos(V(side*(IO_PORT_LENGTH + (w/2 - 0.5)), l));
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
            const pos = target.add(target.sub(origin).normalize().scale(10_000));

            const p = GetNearestPointOnRect(size.scale(-0.5), size.scale(0.5), pos);
            const v = p.sub(pos).normalize().scale(size.scale(0.5).sub(V(IO_PORT_LENGTH).add(size.scale(0.5)))).add(p);

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

    public getInputPortCount(): number {
        return this.inputPorts.length;
    }

    public getOutputPortCount(): number {
        return this.outputPorts.length;
    }

    public getInputPort(i: number): InputPort {
        return this.inputPorts[i];
    }

    public getOutputPort(i: number): OutputPort {
        return this.outputPorts[i];
    }

    public getPorts(): Port[] {
        return [...this.inputPorts, ...this.outputPorts];
    }

    public getGroup(): DigitalObjectSet {
        return this.collection;
    }

    public copy(): DigitalObjectSet {
        return ICData.CreateSet(this.collection.toList());
    }

    private static CreateSet(objs: IOObject[]): DigitalObjectSet {
        const copies = DigitalObjectSet.From(CopyGroup(objs).toList());

        // Move non-whitelisted inputs to regular components list
        //  So that the ports that come out of the IC are useful inputs and not
        //  things like ConstantHigh and ConstantLow which aren't interactive
        const INPUT_WHITELIST = [Switch, Button];
        const OUTPUT_WHITELIST = [LED];
        /* eslint-disable space-in-parens */
        const inputs  = copies.getInputs().filter( (i) =>  INPUT_WHITELIST.some((type) => i instanceof type));
        const outputs = copies.getOutputs().filter((o) => OUTPUT_WHITELIST.some((type) => o instanceof type));
        const others  = copies.getComponents().filter((c) => (!inputs.includes(c) && !outputs.includes(c)));
        /* eslint-enable space-in-parens */

        // Sort inputs/outputs by their position
        const sortByPos = (a: Component, b: Component) => {
            const p1 = a.getPos(), p2 = b.getPos();
            if (Math.abs(p2.y - p1.y) <= 0.5*GRID_SIZE) // If same-ish-y, sort by x from LtR
                return p2.x - p1.x;
            return p2.y - p1.y; // Sort by y-pos from Top to Bottom
        }
        inputs.sort(sortByPos);
        outputs.sort(sortByPos);

        return new DigitalObjectSet(inputs, outputs, others, copies.getWires());
    }

    public static IsValid(objects: IOObject[] | DigitalObjectSet): boolean {
        const BLACKLIST = [SegmentDisplay, Oscilloscope];

        const group = (objects instanceof DigitalObjectSet) ? (objects) : (CreateGroup(objects));

        const objs  = group.getComponents();
        const wires = group.getWires();

        // Make sure there's nothing on the blacklist
        if (objs.some((o) => BLACKLIST.some((type) => o instanceof type)))
            return false;

        // Make sure all wires connected to components are in the group
        const allWires = objs.flatMap((o) => o.getConnections());

        return !(allWires.some((w) => !wires.includes(w)));
    }

    /**
     * This function is the preferred way to create an instance of ICData.
     *
     * @param objects The circuit to create the ICData from. If it is an IOObject[], then the objects are copied.
     *          If it is a DigitalObjectSet, then the objects input will be modified so that Switch and Button are
     *          considered as the only inputs.
     * @returns         The newly created ICData.
     */
    public static Create(objects: IOObject[] | DigitalObjectSet): ICData | undefined {
        objects = (objects instanceof DigitalObjectSet ? objects.toList() : objects);
        const set = ICData.CreateSet(objects);
        if (!this.IsValid(set))
            return undefined;
        return new ICData(set);
    }
}
