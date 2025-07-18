import {GUID} from "shared/api/circuit/schema";


export interface NetlistElement {
    symbol: string;

    uid: GUID;

    node1: GUID;
    node2: GUID;

    values?: string[];
    options?: Record<string, string>;
}

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

export type AnalysisInfo =
    | OPAnalysis
    | TranAnalysis;

export interface Netlist {
    title: string;

    elements: NetlistElement[];

    analyses: AnalysisInfo[];
}
