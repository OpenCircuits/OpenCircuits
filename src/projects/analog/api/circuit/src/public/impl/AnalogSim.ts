import {AnalogSim, AnalysisInfo} from "../AnalogSim";
import {AnalogCircuitContext} from "./AnalogCircuit";


export class AnalogSimImpl implements AnalogSim {
    private readonly ctx: AnalogCircuitContext;

    public constructor(ctx: AnalogCircuitContext) {
        this.ctx = ctx;

        this.analysis = { kind: "op" };
    }

    public analysis: AnalysisInfo;

    public upload(): void {
        throw new Error("Method not implemented.");
    }

    public run(): void {
        throw new Error("Method not implemented.");
    }
}
