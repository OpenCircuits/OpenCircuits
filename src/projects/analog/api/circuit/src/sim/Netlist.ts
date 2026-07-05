import { AnalysisInfo } from "analog/api/circuit/public";
import { GUID } from "shared/api/circuit/schema";

export interface NetlistElement {
    symbol: string;

    uid: GUID;

    node1: GUID;
    node2: GUID;

    values?: string[];
    options?: Record<string, string>;
}

export interface Netlist {
    title: string;

    elements: NetlistElement[];

    analyses: AnalysisInfo[];
}
