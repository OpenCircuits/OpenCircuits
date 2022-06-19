import {NGElementID, NGNetlist, NGNetlistAnalysis, NGNetlistElement, NGSymbol} from "./lib/NGNetlist";


export type NetlistElement = {
    symbol: NGSymbol;

    uid: NGElementID;

    node1: NGElementID;
    node2: NGElementID;

    values?: string[];
    options?: Record<string,string>;
}


export type NetlistOPAnalysis = {
    kind: "op";
}
// export type NetlistDCSweepAnalysis = {
//     kind: "dc";

//     src: string;

//     start: string;
//     end: string;
//     step: string;
// }
export type NetlistTranAnalysis = {
    kind: "tran";

    tstep: string;
    tstop: string;

    tstart?: string;
    tmax?: string;
}

export type NetlistAnalysis =
    | NetlistOPAnalysis
    // | NetlistDCSweepAnalysis
    | NetlistTranAnalysis;

export type Netlist = {
    title: string;

    elements: NetlistElement[];

    analyses: NetlistAnalysis[];
}

export function NetlistToNGSpice(netlist: Netlist): NGNetlist {
    return [
        [".title", netlist.title],
        ...netlist.elements.map((e) => [
            `${e.symbol}${e.uid}`,
            e.node1, e.node2,
            ...(e.values ?? []),
        ] as NGNetlistElement),
        ...netlist.analyses.map(({ kind, ...a }) => [
            `.${kind}`,
            ...Object.values(a),
        ] as NGNetlistAnalysis),
        [".end"],
        ["\0"],
    ]
}

