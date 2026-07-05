export interface OPAnalysis {
    kind: "op";
}
export interface TranAnalysis {
    kind: "tran";

    tstep: string;
    tstop: string;

    tstart?: string;
    tmax?: string;
}
// TODO:
// export type DCSweepAnalysis = {
//     kind: "dc";

//     src: string;

//     start: string;
//     end: string;
//     step: string;
// }

export type AnalysisInfo = OPAnalysis | TranAnalysis;

export interface AnalogSim {
    analysis: AnalysisInfo;

    // Runs the simulation on the current Circuit setup.
    // Will return errors if it fails to validate the circuit.
    run(): void;
}
