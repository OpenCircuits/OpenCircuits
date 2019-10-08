import "jest";

import {Connect, CreateGroup,
        GatherGroup, CopyGroup} from "digital/utils/ComponentUtils";

import {DigitalNode}         from "digital/models/ioobjects/other/DigitalNode";
import {Button}              from "digital/models/ioobjects/inputs/Button";
import {ConstantHigh}        from "digital/models/ioobjects/inputs/ConstantHigh";
import {ConstantLow}         from "digital/models/ioobjects/inputs/ConstantLow";
import {Switch}              from "digital/models/ioobjects/inputs/Switch";
import {LED}                 from "digital/models/ioobjects/outputs/LED";
import {SevenSegmentDisplay} from "digital/models/ioobjects/outputs/SevenSegmentDisplay";
import {ANDGate}             from "digital/models/ioobjects/gates/ANDGate";
import {ORGate}              from "digital/models/ioobjects/gates/ORGate";
import {DFlipFlop}           from "digital/models/ioobjects/flipflops/DFlipFlop";
import {DLatch}              from "digital/models/ioobjects/latches/DLatch";
import {SRLatch}             from "digital/models/ioobjects/latches/SRLatch";

// describe("CreateWire", () => {
//     test("Wire 0", () => {
//         let i  = new Button();
//         let o  = new LED();
//         let p1 = i.getOutputPort(0);
//         let p2 = o.getInputPort(0);
//         let wire = CreateWire(p1,p2);
//         expect(wire.getOutput()).toBe(p2);
//         expect(wire.getInput()).toBe(p1);
//         expect(wire.getInputComponent()).toBe(i);
//         expect(wire.getOutputComponent()).toBe(o);

//         expect(i.getOutputs().length).toBe(1);
//         expect(i.getOutputs()[0]).toBe(wire);
//     });
//     test("Wire 1", () => {
//         let i  = new ConstantLow();
//         let o  = new SevenSegmentDisplay();
//         let p1 = i.getOutputPort(0);
//         let p2 = o.getInputPort(0);
//         let wire = CreateWire(p1,p2);

//         expect(wire.getOutput()).toBe(p2);
//         expect(wire.getInput()).toBe(p1);
//         expect(wire.getInputComponent()).toBe(i);
//         expect(wire.getOutputComponent()).toBe(o);

//         expect(i.getOutputs().length).toBe(1);
//         expect(i.getOutputs()[0]).toBe(wire);
//     });
//     test("Wire 2", () => {
//         let i  = new ConstantHigh();
//         let o  = new LED();
//         let p1 = i.getOutputPort(0);
//         let p2 = o.getInputPort(0);
//         let wire = CreateWire(p1,p2);

//         expect(wire.getOutput()).toBe(p2);
//         expect(wire.getInput()).toBe(p1);
//         expect(wire.getInputComponent()).toBe(i);
//         expect(wire.getOutputComponent()).toBe(o);

//         expect(i.getOutputs().length).toBe(1);
//         expect(i.getOutputs()[0]).toBe(wire);
//     });
//     test("Wire 3", () => {
//         let i  = new Button();
//         let o1 = new LED();
//         let o2 = new SevenSegmentDisplay();
//         let p1 = o1.getInputPort(0);
//         let p2 = o2.getInputPort(0);
//         let p3 = i.getOutputPort(0);
//         let wire1 = CreateWire(p3,p1);
//         let wire2 = CreateWire(p3,p2);

//         expect(wire1.getOutput()).toBe(p1);
//         expect(wire1.getInput()).toBe(p3);
//         expect(wire1.getInputComponent()).toBe(i);
//         expect(wire1.getOutputComponent()).toBe(o1);

//         expect(wire2.getOutput()).toBe(p2);
//         expect(wire2.getInput()).toBe(p3);
//         expect(wire2.getInputComponent()).toBe(i);
//         expect(wire2.getOutputComponent()).toBe(o2);

//         expect(i.getOutputs().length).toBe(2);
//         expect(i.getOutputs()[0]).toBe(wire1);
//         expect(i.getOutputs()[1]).toBe(wire2);
//     });
// });

// describe("Connect", () => {
//     test("Connection 0", () => {
//         let c1   = new Button();
//         let c2   = new LED();
//         let wire = Connect(c1, 0, c2, 0);

//         expect(wire.getInputComponent()).toBe(c1);
//         expect(wire.getOutputComponent()).toBe(c2);
//         expect(wire.getInput()).toBe(c1.getOutputPort(0));
//         expect(wire.getOutput()).toBe(c2.getInputPort(0));
//     });
//     test("Connection 1", () => {
//         let c1 = new ConstantLow();
//         let c2 = new SevenSegmentDisplay();
//         let c4 = new LED();
//         let w1 = Connect(c1, 0, c2, 0);
//         let w2 = Connect(c1, 0, c4, 0);

//         expect(w1.getInputComponent()).toBe(c1);
//         expect(w1.getOutputComponent()).toBe(c2);
//         expect(w1.getInput()).toBe(c1.getOutputPort(0));
//         expect(w1.getOutput()).toBe(c2.getInputPort(0));

//         expect(w2.getInputComponent()).toBe(c1);
//         expect(w2.getOutputComponent()).toBe(c4);
//         expect(w2.getInput()).toBe(c1.getOutputPort(0));
//         expect(w2.getOutput()).toBe(c4.getInputPort(0));
//     });
//     test("Connection 2", () => {
//         let c1 = new ConstantHigh();
//         let c2 = new SevenSegmentDisplay();
//         let c3 = new LED();
//         let w1 = Connect(c1, 0, c2, 0);
//         let w2 = Connect(c1, 0, c3, 0);
//         expect(w1.getInputComponent()).toBe(c1);
//         expect(w1.getOutputComponent()).toBe(c2);
//         expect(w1.getInput()).toBe(c1.getOutputPort(0));
//         expect(w1.getOutput()).toBe(c2.getInputPort(0));

//         expect(w2.getInputComponent()).toBe(c1);
//         expect(w2.getOutputComponent()).toBe(c3);
//         expect(w2.getInput()).toBe(c1.getOutputPort(0));
//         expect(w2.getOutput()).toBe(c3.getInputPort(0));
//     });
//     test("Connection 3", () => {
//         let c1 = new Switch();
//         let c2 = new SevenSegmentDisplay();
//         let w1 = Connect(c1, 0, c2, 0);
//         let w2 = Connect(c1, 0, c2, 1);
//         let w3 = Connect(c1, 0, c2, 2);
//         let w4 = Connect(c1, 0, c2, 3);
//         let w5 = Connect(c1, 0, c2, 4);
//         let w6 = Connect(c1, 0, c2, 5);
//         let w7 = Connect(c1, 0, c2, 6);

//         expect(w1.getInputComponent()).toBe(c1);
//         expect(w1.getOutputComponent()).toBe(c2);
//         expect(w1.getInput()).toBe(c1.getOutputPort(0));
//         expect(w1.getOutput()).toBe(c2.getInputPort(0));

//         expect(w2.getInputComponent()).toBe(c1);
//         expect(w2.getOutputComponent()).toBe(c2);
//         expect(w2.getInput()).toBe(c1.getOutputPort(0));
//         expect(w2.getOutput()).toBe(c2.getInputPort(1));

//         expect(w3.getInputComponent()).toBe(c1);
//         expect(w3.getOutputComponent()).toBe(c2);
//         expect(w3.getInput()).toBe(c1.getOutputPort(0));
//         expect(w3.getOutput()).toBe(c2.getInputPort(2));

//         expect(w4.getInputComponent()).toBe(c1);
//         expect(w4.getOutputComponent()).toBe(c2);
//         expect(w4.getInput()).toBe(c1.getOutputPort(0));
//         expect(w4.getOutput()).toBe(c2.getInputPort(3));

//         expect(w5.getInputComponent()).toBe(c1);
//         expect(w5.getOutputComponent()).toBe(c2);
//         expect(w5.getInput()).toBe(c1.getOutputPort(0));
//         expect(w5.getOutput()).toBe(c2.getInputPort(4));

//         expect(w6.getInputComponent()).toBe(c1);
//         expect(w6.getOutputComponent()).toBe(c2);
//         expect(w6.getInput()).toBe(c1.getOutputPort(0));
//         expect(w6.getOutput()).toBe(c2.getInputPort(5));

//         expect(w7.getInputComponent()).toBe(c1);
//         expect(w7.getOutputComponent()).toBe(c2);
//         expect(w7.getInput()).toBe(c1.getOutputPort(0));
//         expect(w7.getOutput()).toBe(c2.getInputPort(6));
//     });
//     test("Connection 4", () => {
//         let c1 = new Switch();
//         let c2 = new Button();
//         let c3 = new ANDGate();
//         let c4 = new LED();
//         let w1 = Connect(c1, 0, c3, 1);
//         let w2 = Connect(c2, 0, c3, 0);
//         let w3 = Connect(c3, 0, c4, 0);

//         expect(w1.getInputComponent()).toBe(c1);
//         expect(w1.getOutputComponent()).toBe(c3);
//         expect(w1.getInput()).toBe(c1.getOutputPort(0));
//         expect(w1.getOutput()).toBe(c3.getInputPort(1));

//         expect(w2.getInputComponent()).toBe(c2);
//         expect(w2.getOutputComponent()).toBe(c3);
//         expect(w2.getInput()).toBe(c2.getOutputPort(0));
//         expect(w2.getOutput()).toBe(c3.getInputPort(0));

//         expect(w3.getInputComponent()).toBe(c3);
//         expect(w3.getOutputComponent()).toBe(c4);
//         expect(w3.getInput()).toBe(c3.getOutputPort(0));
//         expect(w3.getOutput()).toBe(c4.getInputPort(0));
//     });

// });

// describe("SeparateGroup", () => {
//     const NUM_SAMPLES = 10;
//     function shuffle(a: Array<any>): Array<any> {
//         for (let i = a.length - 1; i > 0; i--) {
//             const j = Math.floor(Math.random() * (i + 1));
//             [a[i], a[j]] = [a[j], a[i]];
//         }
//         return a;
//     }

//     test("Group 1", () => {
//         let group = [new Button(), new ConstantHigh(), new Switch(),
//                      new LED(), new ANDGate(), new DFlipFlop(), new DLatch(),
//                      new SRLatch(), new SevenSegmentDisplay(), new ConstantLow()];
//         for (let i = 0; i < NUM_SAMPLES; i++) {
//             shuffle(group);

//             let separatedGroup = SeparateGroup(group);
//             expect(separatedgroup.getInputs().length).toBe(4);
//             expect(separatedgroup.getOutputs().length).toBe(2);
//             expect(separatedgroup.getOthers().length).toBe(4);
//             expect(separatedgroup.getWires().length).toBe(0);
//         }
//     });
//     test("Group 2", () => {
//         let group = [new Button(), new ConstantHigh(), new Switch(), new ConstantLow()];
//         for (let i = 0; i < NUM_SAMPLES; i++) {
//             shuffle(group);

//             let separatedGroup = SeparateGroup(group);
//             expect(separatedgroup.getInputs().length).toBe(4);
//             expect(separatedgroup.getOutputs().length).toBe(0);
//             expect(separatedgroup.getOthers().length).toBe(0);
//             expect(separatedgroup.getWires().length).toBe(0);
//         }
//     });
//     test("Group 3", () => {
//         let group = [new Button(), new ConstantHigh(), new Switch(),
//                      new LED(), new Button(), new DFlipFlop(), new Button(),
//                      new SRLatch(), new Button(), new ConstantLow()];
//         for (let i = 0; i < NUM_SAMPLES; i++) {
//             shuffle(group);

//             let separatedGroup = SeparateGroup(group);
//             expect(separatedgroup.getInputs().length).toBe(7);
//             expect(separatedgroup.getOutputs().length).toBe(1);
//             expect(separatedgroup.getOthers().length).toBe(2);
//             expect(separatedgroup.getWires().length).toBe(0);
//         }
//     });
//     test("Group 4", () => {
//         let group = [new ANDGate(), new LED(), new ANDGate(),
//                      new LED(), new ANDGate(), new LED(), new ANDGate(),
//                      new ANDGate(), new LED(), new ANDGate()];
//         for (let i = 0; i < NUM_SAMPLES; i++) {
//             shuffle(group);

//             let separatedGroup = SeparateGroup(group);
//             expect(separatedgroup.getInputs().length).toBe(0);
//             expect(separatedgroup.getOutputs().length).toBe(4);
//             expect(separatedgroup.getOthers().length).toBe(6);
//             expect(separatedgroup.getWires().length).toBe(0);
//         }
//     });
// });

describe("CreateGroup", () => {
    test("Group 0", () => {
        let group = CreateGroup([]);

        expect(group.getInputs().length).toBe(0);
        expect(group.getOutputs().length).toBe(0);
        expect(group.getOthers().length).toBe(0);
        expect(group.getWires().length).toBe(0);
        expect(group.getComponents().length).toBe(0);
    });
    test("Group 1", () => {
        let i1 = new Switch();
        let i2 = new Switch();
        let g  = new ANDGate();
        let o1 = new LED();

        Connect(i1, 0,  g, 0);
        Connect(i2, 0,  g, 1);
        Connect(g,  0, o1, 0);

        let group = CreateGroup([i1,i2,g,o1]);

        expect(group.getInputs().length).toBe(2);
        expect(group.getInputs()[0]).toBe(i1);
        expect(group.getInputs()[1]).toBe(i2);

        expect(group.getOutputs().length).toBe(1);
        expect(group.getOutputs()[0]).toBe(o1);

        expect(group.getOthers().length).toBe(1);
        expect(group.getOthers()[0]).toBe(g);

        expect(group.getWires().length).toBe(3);
        expect(group.getComponents().length).toBe(4);
    });
    test("Group 2", () => {
        let i1 = new Switch();
        let i2 = new Button();
        let g  = new ORGate();
        let o1 = new LED();

        let group = CreateGroup([i1,i2,g,o1]);

        Connect(i1, 0,  g, 0);
        Connect(i2, 0,  g, 1);
        Connect(g,  0, o1, 0);

        expect(group.getInputs().length).toBe(2);
        expect(group.getInputs()[0]).toBe(i1);
        expect(group.getInputs()[1]).toBe(i2);

        expect(group.getOutputs().length).toBe(1);
        expect(group.getOutputs()[0]).toBe(o1);

        expect(group.getOthers().length).toBe(1);
        expect(group.getOthers()[0]).toBe(g);

        expect(group.getWires().length).toBe(0);
        expect(group.getComponents().length).toBe(4);
    });

});

describe("GetAllOutgoingPaths", () => {
    describe("Group 1", () => {
        const gate = new ANDGate();

        const wire = Connect(gate, 0,  gate, 0);

        test("Gather Gate", () => {
            const group = GatherGroup([gate]);

            expect(group.getOthers().length).toBe(1);
            expect(group.getWires().length).toBe(1);
            expect(group.getOthers()[0]).toBe(gate);
            expect(group.getWires()[0]).toBe(wire);
        });
    });
    describe("Group 2", () => {
        const gate = new ANDGate();
        const wp = new DigitalNode();

        const wire1 = Connect(gate, 0,  wp,   0);
        const wire2 = Connect(wp,   0,  gate, 0);

        test("Gather Gate", () => {
            const group = GatherGroup([gate]);

            expect(group.getOthers().length).toBe(2);
            expect(group.getWires().length).toBe(2);
            expect(group.getOthers().includes(gate)).toBe(true);
            expect(group.getOthers().includes(wp)).toBe(true);
            expect(group.getWires().includes(wire1)).toBe(true);
            expect(group.getWires().includes(wire2)).toBe(true);
        });
        test("Gather WirePort", () => {
            const removed = GatherGroup([wp]);

            const components = removed.getOthers();
            const wires = removed.getWires();

            expect(components.length).toBe(1);
            expect(wires.length).toBe(2);
            expect(components[0]).toBe(wp);
            expect(wires.includes(wire1)).toBe(true);
            expect(wires.includes(wire2)).toBe(true);
        });
        test("Gather Wire1", () => {
            const removed = GatherGroup([wire1]);

            const components = removed.getOthers();
            const wires = removed.getWires();

            expect(components.length).toBe(1);
            expect(wires.length).toBe(2);
            expect(components[0]).toBe(wp);
            expect(wires.includes(wire1)).toBe(true);
            expect(wires.includes(wire2)).toBe(true);
        });
        test("Gather Wire2", () => {
            const removed = GatherGroup([wire2]);

            const components = removed.getOthers();
            const wires = removed.getWires();

            expect(components.length).toBe(1);
            expect(wires.length).toBe(2);
            expect(components[0]).toBe(wp);
            expect(wires.includes(wire1)).toBe(true);
            expect(wires.includes(wire2)).toBe(true);
        });
    });
    describe("Group 3", () => {
        const s1 = new Switch();
        const s2 = new Switch();
        const gate = new ANDGate();
        const l = new LED();
        const wp1 = new DigitalNode();
        const wp2 = new DigitalNode();
        const wp3 = new DigitalNode();

        const wire1 = Connect(s1, 0,  wp1, 0);
        const wire2 = Connect(s2, 0,  wp2, 0);

        const wire3 = Connect(wp1, 0,  gate, 0);
        const wire4 = Connect(wp2, 0,  gate, 1);

        const wire5 = Connect(gate, 0,  wp3, 0);

        const wire6 = Connect(wp3, 0,  l, 0);

        test("Gather Gate", () => {
            const removed = GatherGroup([gate]);

            const components = removed.getOthers();
            const wires = removed.getWires();

            expect(components.length).toBe(4);
            expect(wires.length).toBe(6);
            expect(components.includes(gate)).toBe(true);
            expect(components.includes(wp1)).toBe(true);
            expect(components.includes(wp2)).toBe(true);
            expect(components.includes(wp3)).toBe(true);
            expect(wires.includes(wire1)).toBe(true);
            expect(wires.includes(wire2)).toBe(true);
            expect(wires.includes(wire3)).toBe(true);
            expect(wires.includes(wire4)).toBe(true);
            expect(wires.includes(wire5)).toBe(true);
            expect(wires.includes(wire6)).toBe(true);
        });
    });
});

describe("CreateGraph", () => {
    // @TODO
});

describe("CopyGroup", () => {
    test("Group 0", () => {
        let copy = CopyGroup([]);

        const inputs = copy.getInputs();
        const components = copy.getOthers();
        const outputs = copy.getOutputs();
        const wires = copy.getWires();

        expect(inputs.length).toBe(0);
        expect(components.length).toBe(0);
        expect(outputs.length).toBe(0);
        expect(wires.length).toBe(0);

        expect(inputs[0]).not.toBe(0);
        expect(components[0]).not.toBe(0);
        expect(outputs[0]).not.toBe(0);
    });
    test("Group 1", () => {
        let i1 = new Switch();
        let i2 = new Switch();
        let g  = new ANDGate();
        let o1 = new LED();

        Connect(i1, 0,  g, 0);
        Connect(i2, 0,  g, 1);
        Connect(g,  0, o1, 0);

        let copy = CopyGroup([i1, i2, g, o1]);

        const inputs = copy.getInputs();
        const components = copy.getOthers();
        const outputs = copy.getOutputs();
        const wires = copy.getWires();

        expect(inputs.length).toBe(2);
        expect(components.length).toBe(1);
        expect(outputs.length).toBe(1);
        expect(wires.length).toBe(3);

        expect(inputs[0]).not.toBe(i1);
        expect(inputs[0]).not.toBe(i2);
        expect(inputs[1]).not.toBe(i1);
        expect(inputs[1]).not.toBe(i2);
        expect(components[0]).not.toBe(g);
        expect(outputs[0]).not.toBe(o1);

        expect(inputs[0].getOutputs().length).toBe(1);
        expect(inputs[0].getOutputs()[0].getOutputComponent()).toBe(components[0]);
        expect(inputs[1].getOutputs().length).toBe(1);
        expect(inputs[1].getOutputs()[0].getOutputComponent()).toBe(components[0]);

        expect(components[0].getOutputs().length).toBe(1);
        expect(components[0].getOutputs()[0].getOutputComponent()).toBe(outputs[0]);
        expect(components[0].getInputs().length).toBe(2);
        expect(components[0].getInputs()[0].getInputComponent()).toBe(inputs[0]);
        expect(components[0].getInputs()[1].getInputComponent()).toBe(inputs[1]);

        expect(outputs[0].getInputs().length).toBe(1);
        expect(outputs[0].getInputs()[0].getInputComponent()).toBe(components[0]);
    });
    test("Group 2", () => {
        let i1 = new Switch();

        let copy = CopyGroup([i1]);

        const inputs = copy.getInputs();
        const components = copy.getOthers();
        const outputs = copy.getOutputs();
        const wires = copy.getWires();

        expect(inputs.length).toBe(1);
        expect(components.length).toBe(0);
        expect(outputs.length).toBe(0);
        expect(wires.length).toBe(0);

        expect(inputs[0]).not.toBe(i1);
    });
    test("Group 3", () => {
        let i = new Switch();
        let o = new SevenSegmentDisplay();

        Connect(i,0,o,0);

        let copy = CopyGroup([i,o]);

        const inputs = copy.getInputs();
        const components = copy.getOthers();
        const outputs = copy.getOutputs();
        const wires = copy.getWires();

        expect(inputs.length).toBe(1);
        expect(components.length).toBe(0);
        expect(outputs.length).toBe(1);
        expect(wires.length).toBe(1);

        expect(inputs[0]).not.toBe(i);
        expect(outputs[0]).not.toBe(o);

        expect(inputs[0].getOutputs().length).toBe(1);
        expect(inputs[0].getOutputs()[0].getOutputComponent()).toBe(outputs[0]);
        expect(outputs[0].getInputs().length).toBe(1);
        expect(outputs[0].getInputs()[0].getInputComponent()).toBe(inputs[0]);
    });
    test("Group 4", () => {
        let i1 = new Button();
        let i2 = new Switch();
        let i3 = new Button();
        let o1 = new LED();
        let o2 = new LED();
        let c1 = new ORGate();
        let c2 = new ANDGate();

        Connect(i2,0,c2,0);
        Connect(c2,0,o2,0);

        Connect(i1,0,c1,0);
        Connect(i3,0,c1,1);
        Connect(c1,0,o1,0);

        let copy1 = CopyGroup([i1,i3,c1,o1]);
        let copy2 = CopyGroup([i2,c2,o2]);

        const inputs1 = copy1.getInputs();
        const components1 = copy1.getOthers();
        const outputs1 = copy1.getOutputs();
        const wires1 = copy1.getWires();

        expect(inputs1.length).toBe(2);
        expect(components1.length).toBe(1);
        expect(outputs1.length).toBe(1);
        expect(wires1.length).toBe(3);

        expect(inputs1[0]).not.toBe(i1);
        expect(inputs1[0]).not.toBe(i3);
        expect(inputs1[1]).not.toBe(i1);
        expect(inputs1[1]).not.toBe(i3);
        expect(outputs1[0]).not.toBe(o1);
        expect(components1[0]).not.toBe(c1);

        expect(inputs1[0].getOutputs().length).toBe(1);
        expect(inputs1[0].getOutputs()[0].getOutputComponent()).toBe(components1[0]);
        expect(inputs1[1].getOutputs().length).toBe(1);
        expect(inputs1[1].getOutputs()[0].getOutputComponent()).toBe(components1[0]);
        expect(outputs1[0].getInputs().length).toBe(1);
        expect(outputs1[0].getInputs()[0].getInputComponent()).toBe(components1[0]);

        const inputs2 = copy2.getInputs();
        const components2 = copy2.getOthers();
        const outputs2 = copy2.getOutputs();
        const wires2 = copy2.getWires();

        expect(inputs2.length).toBe(1);
        expect(components2.length).toBe(1);
        expect(outputs2.length).toBe(1);
        expect(wires2.length).toBe(2);

        expect(inputs2[0]).not.toBe(i2);
        expect(outputs2[0]).not.toBe(o2);
        expect(components2[0]).not.toBe(c2);

        expect(inputs2[0].getOutputs().length).toBe(1);
        expect(inputs2[0].getOutputs()[0].getOutputComponent()).toBe(components2[0]);
        expect(outputs2[0].getInputs().length).toBe(1);
        expect(outputs2[0].getInputs()[0].getInputComponent()).toBe(components2[0]);
    });
    test("Group 5", () => {
        let i1 = new Button();
        let i2 = new Switch();
        let o1 = new SevenSegmentDisplay();
        let c1 = new ORGate();
        let c2 = new ORGate();
        let c3 = new ANDGate();

        Connect(i1,0,c1,0);
        Connect(i1,0,c2,0);
        Connect(i2,0,c1,1);
        Connect(i2,0,c2,1);
        Connect(c1,0,c3,0);
        Connect(c2,0,c3,1);
        Connect(c1,0,o1,0);
        Connect(c1,0,o1,1);
        Connect(c3,0,o1,2);
        Connect(c3,0,o1,3);
        Connect(c3,0,o1,4);
        Connect(c2,0,o1,5);
        Connect(c2,0,o1,6);

        let copy = CopyGroup([i1,i2,c1,c2,c3,o1]);

        const inputs = copy.getInputs();
        const components = copy.getOthers();
        const outputs = copy.getOutputs();
        const wires = copy.getWires();

        expect(inputs.length).toBe(2);
        expect(components.length).toBe(3);
        expect(outputs.length).toBe(1);
        expect(wires.length).toBe(13);

        expect(inputs[0]).not.toBe(i1);
        expect(inputs[0]).not.toBe(i2);
        expect(inputs[1]).not.toBe(i2);
        expect(inputs[1]).not.toBe(i1);
        expect(components[0]).not.toBe(c1);
        expect(components[0]).not.toBe(c3);
        expect(components[0]).not.toBe(c2);
        expect(components[1]).not.toBe(c2);
        expect(components[1]).not.toBe(c1);
        expect(components[1]).not.toBe(c3);
        expect(components[2]).not.toBe(c3);
        expect(components[2]).not.toBe(c2);
        expect(components[2]).not.toBe(c1);
        expect(outputs[0]).not.toBe(o1);

        expect(inputs[0].getOutputs().length).toBe(2);
        expect(inputs[0].getOutputs()[0].getOutputComponent()).toBe(components[0]);
        expect(inputs[0].getOutputs()[1].getOutputComponent()).toBe(components[1]);
        expect(inputs[1].getOutputs().length).toBe(2);
        expect(inputs[1].getOutputs()[0].getOutputComponent()).toBe(components[0]);
        expect(inputs[1].getOutputs()[1].getOutputComponent()).toBe(components[1]);

        expect(outputs[0].getInputs().length).toBe(7);
        expect(outputs[0].getInputs()[0].getInputComponent()).toBe(components[0]);
        expect(outputs[0].getInputs()[1].getInputComponent()).toBe(components[0]);
        expect(outputs[0].getInputs()[2].getInputComponent()).toBe(components[2]);
        expect(outputs[0].getInputs()[3].getInputComponent()).toBe(components[2]);
        expect(outputs[0].getInputs()[4].getInputComponent()).toBe(components[2]);
        expect(outputs[0].getInputs()[5].getInputComponent()).toBe(components[1]);
        expect(outputs[0].getInputs()[6].getInputComponent()).toBe(components[1]);

        expect(components[0].getInputs().length).toBe(2);
        expect(components[0].getInputs()[0].getInputComponent()).toBe(inputs[0]);
        expect(components[0].getInputs()[1].getInputComponent()).toBe(inputs[1]);
        expect(components[0].getOutputs().length).toBe(3);
        expect(components[0].getOutputs()[0].getOutputComponent()).toBe(components[2]);
        expect(components[0].getOutputs()[1].getOutputComponent()).toBe(outputs[0]);
        expect(components[0].getOutputs()[2].getOutputComponent()).toBe(outputs[0]);

        expect(components[1].getInputs().length).toBe(2);
        expect(components[1].getInputs()[0].getInputComponent()).toBe(inputs[0]);
        expect(components[1].getInputs()[1].getInputComponent()).toBe(inputs[1]);
        expect(components[0].getOutputs().length).toBe(3);
        expect(components[0].getOutputs()[0].getOutputComponent()).toBe(components[2]);
        expect(components[0].getOutputs()[1].getOutputComponent()).toBe(outputs[0]);
        expect(components[0].getOutputs()[2].getOutputComponent()).toBe(outputs[0]);

        expect(components[2].getInputs().length).toBe(2);
        expect(components[2].getInputs()[0].getInputComponent()).toBe(components[0]);
        expect(components[2].getInputs()[1].getInputComponent()).toBe(components[1]);
        expect(components[2].getOutputs().length).toBe(3);
        expect(components[2].getOutputs()[0].getOutputComponent()).toBe(outputs[0]);
        expect(components[2].getOutputs()[1].getOutputComponent()).toBe(outputs[0]);
        expect(components[2].getOutputs()[2].getOutputComponent()).toBe(outputs[0]);
    });
    test("Group 6", () => {
        let i1 = new Switch();
        let i2 = new Button();
        let o1 = new LED();
        let o2 = new SevenSegmentDisplay();
        let c1 = new ANDGate();
        let c2 = new ORGate();
        let p1 = new DigitalNode();
        let p2 = new DigitalNode();

        Connect(i1,0,c1,0);
        Connect(c1,0,p2,0);
        Connect(p2,0,o1,0);
        Connect(c1,0,c2,0);
        Connect(i2,0,p1,0);
        Connect(p1,0,c1,1);
        Connect(i2,0,o2,0);
        Connect(i2,0,o2,3);
        Connect(i2,0,o2,5);

        let copy = CopyGroup([i1,i2,o1,o2,c1,c2,p1,p2]);

        const inputs = copy.getInputs();
        const components = copy.getOthers();
        const outputs = copy.getOutputs();
        const wires = copy.getWires();

        expect(inputs.length).toBe(2);
        expect(components.length).toBe(4);
        expect(outputs.length).toBe(2);
        expect(wires.length).toBe(9);

        expect(inputs[0]).not.toBe(i1);
        expect(inputs[0]).not.toBe(i2);
        expect(inputs[1]).not.toBe(i2);
        expect(inputs[1]).not.toBe(i1);
        expect(components[0]).not.toBe(c1);
        expect(components[0]).not.toBe(c2);
        expect(components[0]).not.toBe(p1);
        expect(components[0]).not.toBe(p2);
        expect(components[1]).not.toBe(c1);
        expect(components[1]).not.toBe(c2);
        expect(components[1]).not.toBe(p1);
        expect(components[1]).not.toBe(p2);
        expect(components[2]).not.toBe(c1);
        expect(components[2]).not.toBe(c2);
        expect(components[2]).not.toBe(p1);
        expect(components[2]).not.toBe(p2);
        expect(components[3]).not.toBe(c1);
        expect(components[3]).not.toBe(c2);
        expect(components[3]).not.toBe(p1);
        expect(components[3]).not.toBe(p2);
        expect(outputs[0]).not.toBe(o1);
        expect(outputs[0]).not.toBe(o2);
        expect(outputs[1]).not.toBe(o1);
        expect(outputs[1]).not.toBe(o2);

        expect(inputs[0].getOutputs().length).toBe(1);
        expect(inputs[0].getOutputs()[0].getOutputComponent()).toBe(components[0]);
        expect(inputs[1].getOutputs().length).toBe(4);
        expect(inputs[1].getOutputs()[0].getOutputComponent()).toBe(components[2]);
        expect(inputs[1].getOutputs()[1].getOutputComponent()).toBe(outputs[1]);
        expect(inputs[1].getOutputs()[2].getOutputComponent()).toBe(outputs[1]);
        expect(inputs[1].getOutputs()[3].getOutputComponent()).toBe(outputs[1]);

        expect(outputs[0].getInputs().length).toBe(1);
        expect(outputs[0].getInputs()[0].getInputComponent()).toBe(components[3]);
        expect(outputs[1].getInputs().length).toBe(3);
        expect(outputs[1].getInputs()[0].getInputComponent()).toBe(inputs[1]);
        expect(outputs[1].getInputs()[1].getInputComponent()).toBe(inputs[1]);
        expect(outputs[1].getInputs()[2].getInputComponent()).toBe(inputs[1]);

        expect(components[0].getInputs().length).toBe(2);
        expect(components[0].getInputs()[0].getInputComponent()).toBe(inputs[0]);
        expect(components[0].getInputs()[1].getInputComponent()).toBe(components[2]);
        expect(components[1].getInputs().length).toBe(1);
        expect(components[1].getInputs()[0].getInputComponent()).toBe(components[0]);
        expect(components[2].getInputs().length).toBe(1);
        expect(components[2].getInputs()[0].getInputComponent()).toBe(inputs[1]);
        expect(components[2].getOutputs().length).toBe(1);
        expect(components[2].getOutputs()[0].getOutputComponent()).toBe(components[0]);
        expect(components[3].getInputs().length).toBe(1);
        expect(components[3].getInputs()[0].getInputComponent()).toBe(components[0]);
        expect(components[3].getOutputs().length).toBe(1);
        expect(components[3].getOutputs()[0].getOutputComponent()).toBe(outputs[0]);
    });
});
