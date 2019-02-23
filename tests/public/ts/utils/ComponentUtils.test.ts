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
    it("Group 1", () => {
        let group = [new Button(), new ConstantHigh(), new Switch(),
                     new LED(), new ANDGate(), new DFlipFlop(), new DLatch(),
                     new SRLatch(), new SevenSegmentDisplay(), new ConstantLow()];
        let separatedGroup = SeparateGroup(group);
        expect(separatedGroup.inputs.length).toBe(4);
        expect(separatedGroup.outputs.length).toBe(2);
        expect(separatedGroup.components.length).toBe(4);
    });
});

describe("CreateGroup", () => {
    // @TODO
});

describe("GetAllWires", () => {
    // @TODO
});

describe("CreateGraph", () => {
    // @TODO
});

describe("CopyGroup", () => {
    // @TODO
});
