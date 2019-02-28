import "jest";

import {CreateWire, Connect, SeparateGroup,
        CreateGroup, GetAllWires, CreateGraph,
        CopyGroup, SeparatedComponentCollection} from "../../../../site/public/ts/utils/ComponentUtils";
import {Vector, V} from "../../../../site/public/ts/utils/math/Vector";
import {Transform} from "../../../../site/public/ts/utils/math/Transform";

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
    // @TODO
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
        let g = new ANDGate();
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
        let g = new ANDGate();
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
