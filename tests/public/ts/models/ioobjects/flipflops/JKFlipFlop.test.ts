import "jest";

import {CircuitDesigner} from "../../../../../../site/public/ts/models/CircuitDesigner";
import {Switch}          from "../../../../../../site/public/ts/models/ioobjects/inputs/Switch";
import {JKFlipFlop}         from "../../../../../../site/public/ts/models/ioobjects/flipflops/JKFlipFlop";
import {LED}             from "../../../../../../site/public/ts/models/ioobjects/outputs/LED";

describe("JKFlipFLop", () => {
    const designer = new CircuitDesigner(0);
    const clk = new Switch(), data = new Switch(), f = new JKFlipFlop(), l0 = new LED(), l1 = new LED();
});
