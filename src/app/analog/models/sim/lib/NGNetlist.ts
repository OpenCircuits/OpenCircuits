
type RawLetter = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N"
                        | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z";
type Letter = RawLetter | Lowercase<RawLetter>;

export type NGSymbol = Letter;

export type NGElementID = string | number;

export type NGUnit = number;

export type NGNetlistElement = [
    `${NGSymbol}${NGElementID | ""}`, // symbol + uid
    NGElementID, // node1
    NGElementID, // node2
    ...Array<string | `${string}=${string}`>, // values, options
];

export type NGNetlistOPAnalysis = [".op"];
export type NGNetlistDCSweepAnalysis = [
    ".dc",
    NGElementID, // srcname
    NGUnit,      // vstart
    NGUnit,      // vstop
    NGUnit,      // vincr
];
export type NGNetlistTranAnalysis = [
    ".tran",
    NGUnit,  // tstep
    NGUnit,  // tstop
    NGUnit?, // <tstart>
    NGUnit?, // <<tmax>>
];

export type NGNetlistAnalysis =
    | NGNetlistOPAnalysis
    | NGNetlistDCSweepAnalysis
    | NGNetlistTranAnalysis;

export type NGNetlist = [
    [".title",string],
    ...Array<NGNetlistElement | NGNetlistAnalysis>,
    [".end"],
    ["\0"],
];
