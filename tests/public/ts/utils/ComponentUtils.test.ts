import "jest";

import {CreateWire, Connect, SeparateGroup,
        CreateGroup, GetAllWires, CreateGraph,
        CopyGroup, SeparatedComponentCollection} from "../../../../site/public/ts/utils/ComponentUtils";
import {Vector, V} from "../../../../site/public/ts/utils/math/Vector";
import {Transform} from "../../../../site/public/ts/utils/math/Transform";

import {Wire} from "../../../../site/public/ts/models/ioobjects/Wire";
import {OutputPort} from "../../../../site/public/ts/models/ioobjects/OutputPort";
import {InputPort} from "../../../../site/public/ts/models/ioobjects/InputPort";
import {Component} from "../../../../site/public/ts/models/ioobjects/Component";
import {Button} from "../../../../site/public/ts/models/ioobjects/inputs/Button";
import {ConstantHigh} from "../../../../site/public/ts/models/ioobjects/inputs/ConstantHigh";
import {ConstantLow} from "../../../../site/public/ts/models/ioobjects/inputs/ConstantLow";
import {Switch} from "../../../../site/public/ts/models/ioobjects/inputs/Switch";
import {LED} from "../../../../site/public/ts/models/ioobjects/outputs/LED";
import {SevenSegmentDisplay} from "../../../../site/public/ts/models/ioobjects/outputs/SevenSegmentDisplay";
import {ANDGate} from "../../../../site/public/ts/models/ioobjects/gates/ANDGate";
import {ORGate} from "../../../../site/public/ts/models/ioobjects/gates/ORGate";
import {DFlipFlop} from "../../../../site/public/ts/models/ioobjects/flipflops/DFlipFlop";
import {JKFlipFlop} from "../../../../site/public/ts/models/ioobjects/flipflops/JKFlipFlop";
import {DLatch} from "../../../../site/public/ts/models/ioobjects/latches/DLatch";
import {SRLatch} from "../../../../site/public/ts/models/ioobjects/latches/SRLatch";

describe("CreateWire", () => {
    it("Wire 0", () => {
        let i  = new Button();
        let o  = new LED();
        let p1 = i.getOutputPort(0);
        let p2 = o.getInputPort(0);
        let wire = CreateWire(p1,p2);
        expect(wire.getOutput()).toBe(p2);
        expect(wire.getInput()).toBe(p1);
        expect(wire.getInputComponent()).toBe(i);
        expect(wire.getOutputComponent()).toBe(o);
        expect(i.getOutputs().length).toBe(1);
        expect(i.getOutputs()[0]).toBe(wire);
    });
    it("Wire 1", () => {
        let i  = new ConstantLow();
        let o  = new SevenSegmentDisplay();
        let p1 = i.getOutputPort(0);
        let p2 = o.getInputPort(0);
        let wire = CreateWire(p1,p2);
        expect(wire.getOutput()).toBe(p2);
        expect(wire.getInput()).toBe(p1);
        expect(wire.getInputComponent()).toBe(i);
        expect(wire.getOutputComponent()).toBe(o);
        expect(i.getOutputs().length).toBe(1);
        expect(i.getOutputs()[0]).toBe(wire);
    });
    it("Wire 2", () => {
        let i  = new ConstantHigh();
        let o  = new LED();
        let p1 = i.getOutputPort(0);
        let p2 = o.getInputPort(0);
        let wire = CreateWire(p1,p2);
        expect(wire.getOutput()).toBe(p2);
        expect(wire.getInput()).toBe(p1);
        expect(wire.getInputComponent()).toBe(i);
        expect(wire.getOutputComponent()).toBe(o);
        expect(i.getOutputs().length).toBe(1);
        expect(i.getOutputs()[0]).toBe(wire);
    });
    it("Wire 3", () => {
        let i  = new Button();
        let o1 = new LED();
        let o2 = new SevenSegmentDisplay();
        let p1 = o1.getInputPort(0);
        let p2 = o2.getInputPort(0);
        let p3 = i.getOutputPort(0);
        let wire1 = CreateWire(p3,p1);
        let wire2 = CreateWire(p3,p2);
        expect(wire1.getOutput()).toBe(p1);
        expect(wire1.getInput()).toBe(p3);
        expect(wire1.getInputComponent()).toBe(i);
        expect(wire1.getOutputComponent()).toBe(o1);
        expect(wire2.getOutput()).toBe(p2);
        expect(wire2.getInput()).toBe(p3);
        expect(wire2.getInputComponent()).toBe(i);
        expect(wire2.getOutputComponent()).toBe(o2);
        expect(i.getOutputs().length).toBe(2);
        expect(i.getOutputs()[0]).toBe(wire1);
        expect(i.getOutputs()[1]).toBe(wire2);
    });
});

describe("Connect", () => {
    // @TODO
});

describe("SeparateGroup", () => {
    const NUM_SAMPLES = 10;
    function shuffle(a: Array<any>): Array<any> {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    it("Group 1", () => {
        let group = [new Button(), new ConstantHigh(), new Switch(),
                     new LED(), new ANDGate(), new DFlipFlop(), new DLatch(),
                     new SRLatch(), new SevenSegmentDisplay(), new ConstantLow()];
        for (let i = 0; i < NUM_SAMPLES; i++) {
            shuffle(group);

            let separatedGroup = SeparateGroup(group);
            expect(separatedGroup.inputs.length).toBe(4);
            expect(separatedGroup.outputs.length).toBe(2);
            expect(separatedGroup.components.length).toBe(4);
            expect(separatedGroup.wires.length).toBe(0);
        }
    });
    it("Group 2", () => {
        let group = [new Button(), new ConstantHigh(), new Switch(), new ConstantLow()];
        for (let i = 0; i < NUM_SAMPLES; i++) {
            shuffle(group);

            let separatedGroup = SeparateGroup(group);
            expect(separatedGroup.inputs.length).toBe(4);
            expect(separatedGroup.outputs.length).toBe(0);
            expect(separatedGroup.components.length).toBe(0);
            expect(separatedGroup.wires.length).toBe(0);
        }
    });
    it("Group 3", () => {
        let group = [new Button(), new ConstantHigh(), new Switch(),
                     new LED(), new Button(), new DFlipFlop(), new Button(),
                     new SRLatch(), new Button(), new ConstantLow()];
        for (let i = 0; i < NUM_SAMPLES; i++) {
            shuffle(group);

            let separatedGroup = SeparateGroup(group);
            expect(separatedGroup.inputs.length).toBe(7);
            expect(separatedGroup.outputs.length).toBe(1);
            expect(separatedGroup.components.length).toBe(2);
            expect(separatedGroup.wires.length).toBe(0);
        }
    });
    it("Group 4", () => {
        let group = [new ANDGate(), new LED(), new ANDGate(),
                     new LED(), new ANDGate(), new LED(), new ANDGate(),
                     new ANDGate(), new LED(), new ANDGate()];
        for (let i = 0; i < NUM_SAMPLES; i++) {
            shuffle(group);

            let separatedGroup = SeparateGroup(group);
            expect(separatedGroup.inputs.length).toBe(0);
            expect(separatedGroup.outputs.length).toBe(4);
            expect(separatedGroup.components.length).toBe(6);
            expect(separatedGroup.wires.length).toBe(0);
        }
    });
});

describe("CreateGroup", () => {
    // @TODO
});

describe("GetAllWires", () => {
    it("Group 1", () => {
        let i1 = new Switch();
        let i2 = new Switch();
        let g  = new ANDGate();
        let o1 = new LED();

        Connect(i1, 0,  g, 0);
        Connect(i2, 0,  g, 1);
        Connect(g,  0, o1, 0);

        expect(GetAllWires([i1,i2,g,o1]).length).toBe(3);
    });
});

describe("CreateGraph", () => {
    // @TODO
});

describe("CopyGroup", () => {
    it("Group 1", () => {
        let i1 = new Switch();
        let i2 = new Switch();
        let g  = new ANDGate();
        let o1 = new LED();

        Connect(i1, 0,  g, 0);
        Connect(i2, 0,  g, 1);
        Connect(g,  0, o1, 0);

        let copy = CopyGroup([i1, i2, g, o1]);
        expect(copy.inputs.length).toBe(2);
        expect(copy.components.length).toBe(1);
        expect(copy.outputs.length).toBe(1);
        expect(copy.wires.length).toBe(3);

        expect(copy.inputs[0]).not.toBe(i1);
        expect(copy.inputs[1]).not.toBe(i2);
        expect(copy.components[0]).not.toBe(g);
        expect(copy.outputs[0]).not.toBe(o1);
    });
});
