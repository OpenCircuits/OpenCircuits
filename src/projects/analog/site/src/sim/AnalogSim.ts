import {AnalogSim, AnalysisInfo} from "analog/api/circuit/public";
import {NGSpiceLib} from "./lib/NGSpiceLib";
import {CreateWASMInstance} from "./lib/WASM";
import {Netlist} from "./Netlist";
import {CircuitInternal} from "shared/api/circuit/internal";
import {CircuitToNetlist} from "./NetlistGenerator";

type RawLetter = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N"
                        | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z";
type Letter = RawLetter | Lowercase<RawLetter>;

type NGSymbol = Letter;
type NGElementID = string | number;
type NGUnit = number;

type NGNetlistOPAnalysis = [".op"];
type NGNetlistDCSweepAnalysis = [
    ".dc",
    NGElementID, // srcname
    NGUnit,      // vstart
    NGUnit,      // vstop
    NGUnit,      // vincr
];
type NGNetlistTranAnalysis = [
    ".tran",
    NGUnit,  // tstep
    NGUnit,  // tstop
    NGUnit?, // <tstart>
    NGUnit?, // <<tmax>>
];
type NGNetlistAnalysis =
    | NGNetlistOPAnalysis
    | NGNetlistDCSweepAnalysis
    | NGNetlistTranAnalysis;

type NGNetlistElement = [
    `${NGSymbol}${NGElementID | ""}`, // symbol + uid
    NGElementID, // node1
    NGElementID, // node2
    ...Array<string | `${string}=${string}`>, // values, options
];

type NGNetlist = [
    [".title",string],
    ...Array<NGNetlistElement | NGNetlistAnalysis>,
    [".end"],
    ["\0"],
]

type WASMLib = ReturnType<typeof CreateWASMInstance<NGSpiceLib>>;

type VecSimDataKey = `${string}.${string}`;
interface SimData {
    plotIDs: string[];
    curPlotID: string;
    vecIDs: Record<string, string[]>;
    vecs: Record<VecSimDataKey, {
        len: number;
        data: number[];
    }>;
}

class NGSpiceLibImpl {
    private netlistPtrs?: [number, ...number[]];
    private lib: WASMLib;

    public constructor(lib: WASMLib) {
        this.lib = lib;
    }

    private convertNetlist(netlist: Netlist): NGNetlist {
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
        ];
    }

    public uploadNetlist(netlist: Netlist): void {
        // If netlist already exists, free it
        if (this.netlistPtrs)
            this.netlistPtrs.forEach((ptr) => this.lib.free_array(ptr));

        const ngNetList = this.convertNetlist(netlist);

        // Upload data to NGSpice
        this.netlistPtrs = this.lib.create_str_array(ngNetList.map((line) => line.join(" ")));
        this.lib.OC_set_data(this.netlistPtrs[0]);
    }

    public run(): SimData {
        this.lib.OC_run();

        // Gather data (slice off end which has "const" plot/data)
        const plotIDPtrs = this.lib.get_array(this.lib.OC_get_plot_ids(), { type: "string*" }).slice(0, -1);
        const plotIDs = plotIDPtrs.map((ptr) => this.lib.get_array(ptr, { type: "char" }));
        const curPlotID = this.lib.get_array(this.lib.OC_get_cur_plot(), { type: "char" });
    
        // Get vec IDs
        const vecIDs = Object.fromEntries(plotIDPtrs.map((plotIDPtr, i) =>
            [plotIDs[i], this.lib.get_array(this.lib.OC_get_vector_ids(plotIDPtr), { type: "string" })]
        ));

        // Get vec data
        const allIDs = plotIDs.flatMap((plotID) => vecIDs[plotID].map((id) => `${plotID}.${id}`));
        const vecs = allIDs.reduce((prev, id) => {
            const idPtr = this.lib.create_array("string", id);

            const len = this.lib.OC_get_vector_len(idPtr);
            const data = this.lib.get_array(this.lib.OC_get_vector_data(idPtr), { type: "double", len });

            // TODO: free `idPtr`

            return { ...prev, [id]: { len, data } };
        }, {});

        return { plotIDs, curPlotID, vecIDs, vecs };
    }

    public printData() {
        this.lib.OC_print_data();
    }
}

export class AnalogSimImpl implements AnalogSim {
    public analysis: AnalysisInfo;

    private readonly circuit: CircuitInternal;
    private readonly lib: NGSpiceLibImpl;

    private curData?: SimData;

    public constructor(circuit: CircuitInternal, lib: WASMLib) {
        this.circuit = circuit;
        this.lib = new NGSpiceLibImpl(lib);

        this.analysis = { kind: "op" };
    }
    public run() {
        const [netlist, mappings] = CircuitToNetlist(this.circuit.getMetadata().name, this.analysis, this.circuit);
        this.lib.uploadNetlist(netlist);

        // Happens sychronously which is fine for now but needs to change
        this.curData = this.lib.run();
    }

    // public getPlotIDs() {
    //     return this.curData?.plotIDs;
    // }

    // public getCurPlotID() {
    //     return this.curData?.curPlotID;
    // }

    // public getVecIDs(plotID = this.getCurPlotID()) {
    //     return this.curData?.vecIDs[plotID ?? ""];
    // }

    // public getFullVecIDs(plotID = this.getCurPlotID()) {
    //     return this.getVecIDs()?.map((id) => `${plotID}.${id}` as const);
    // }

    // public getVecs(plotID = this.getCurPlotID()) {
    //     return this.curData?.vecIDs[plotID ?? ""].map((id) => this.curData?.vecs[`${plotID}.${id}`]);
    // }

    // public getVecLen(id: VecSimDataKey) {
    //     return this.curData?.vecs[id].len;
    // }

    // public getVecData(id: VecSimDataKey) {
    //     return this.curData?.vecs[id].data;
    // }

    // public getVecDataIm(_id: string): Array<{ re: number, im: number }> {
    //     // const idPtr = this.lib.create_array("string", id);
    //     // const vecDataPtr = this.lib.get_vector_data(idPtr);
    //     // return this.lib.get_array(vecDataPtr, { type: "double", len: this.getVecLen(id) });
    //     throw new Error("TODO");
    // }

    // public hasData() {
    //     return !!this.curData;
    // }

    // public printData() {
    //     this.lib.printData();
    // }
}

export function MakeAnalogSim(lib: WASMLib) {
    return (circuit: CircuitInternal) => new AnalogSimImpl(circuit, lib);
}
