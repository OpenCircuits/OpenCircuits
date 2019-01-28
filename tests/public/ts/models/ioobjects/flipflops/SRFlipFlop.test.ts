import "jest";

import {CircuitDesigner} from "../../../../../../site/public/ts/models/CircuitDesigner";
import {Switch}          from "../../../../../../site/public/ts/models/ioobjects/inputs/Switch";
import {SRFlipFlop}         from "../../../../../../site/public/ts/models/ioobjects/flipflops/SRFlipFlop";
import {LED}             from "../../../../../../site/public/ts/models/ioobjects/outputs/LED";

describe("JKFlipFLop", () => {
    const designer = new CircuitDesigner(0);
    const clk = new Switch(), data = new Switch(), f = new SRFlipFlop(), l0 = new LED(), l1 = new LED();
});
