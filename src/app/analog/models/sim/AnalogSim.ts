
import {NGSpiceLib}                from "./lib/NGSpiceLib";
import {CreateWASMInstance}        from "./lib/WASM";
import {Netlist, NetlistToNGSpice} from "./Netlist";


const MakeInstance = (lib: NGSpiceLib) => CreateWASMInstance(lib);

export class AnalogSim {
    private readonly lib: ReturnType<typeof MakeInstance>;

    private netlistPtrs: [number, ...number[]];

    private plotIDs: string[];
    private curPlotID: string;
    private vecIDs: Record<string, string[]>;
    private vecs: Record<`${string}.${string}`, {
        len: number;
        data: number[];
    }>;

    public constructor(lib: NGSpiceLib) {
        this.lib = MakeInstance(lib);
    }

    public init() {
        this.lib.init();
    }

    public uploadNetlist(netlist: Netlist) {
        // If netlist already exists, free it
        if (this.netlistPtrs)
            this.netlistPtrs.forEach((ptr) => this.lib.free_array(ptr));

        // Convert netlist to format for NGSpice
        const ngNetList = NetlistToNGSpice(netlist).map((line) => line.join(" "));

        // console.log(ngNetList.join("\n"));

        // Upload data to NGSpice
        this.netlistPtrs = this.lib.create_str_array(ngNetList);
        this.lib.set_data(this.netlistPtrs[0]);
    }

    public run() {
        // Happens sychronously which is fine for now but needs to change
        this.lib.run();

        // Gather data (slice off end which has "const" plot/data)
        const plotIDPtrs = this.lib.get_array(this.lib.get_plot_ids(), { type: "string*" }).slice(0, -1);
        this.plotIDs = plotIDPtrs.map((ptr) => this.lib.get_array(ptr, { type: "char" }));
        this.curPlotID = this.lib.get_array(this.lib.get_cur_plot(), { type: "char" });
        { // Get vec IDs
            this.vecIDs = Object.fromEntries(plotIDPtrs.map((plotIDPtr, i) =>
                [this.plotIDs[i], this.lib.get_array(this.lib.get_vector_ids(plotIDPtr), { type: "string" })]
            ));
        }
        { // Get vec data
            const allIDs = this.plotIDs.flatMap((plotID) => this.vecIDs[plotID].map((id) => `${plotID}.${id}`));
            this.vecs = allIDs.reduce((prev, id) => {
                const idPtr = this.lib.create_array("string", id);

                const len = this.lib.get_vector_len(idPtr);
                const data = this.lib.get_array(this.lib.get_vector_data(idPtr), { type: "double", len });

                // TODO: free `idPtr`

                return { ...prev, [id]: { len, data } };
            }, {});
        }
    }

    public getPlotIDs() {
        return this.plotIDs;
    }

    public getCurPlotID() {
        return this.curPlotID;
    }

    public getVecIDs(plotID = this.getCurPlotID()) {
        return this.vecIDs[plotID];
    }

    public getFullVecIDs(plotID = this.getCurPlotID()) {
        return this.getVecIDs().map((id) => `${plotID}.${id}` as const);
    }

    public getVecs(plotID = this.getCurPlotID()) {
        return this.vecIDs[plotID].map((id) => this.vecs[`${plotID}.${id}`]);
    }

    public getVecLen(id: keyof typeof this.vecs) {
        return this.vecs[id].len;
    }

    public getVecData(id: keyof typeof this.vecs) {
        return this.vecs[id].data;
    }

    public getVecDataIm(_id: string): Array<{ re: number, im: number }> {
        // const idPtr = this.lib.create_array("string", id);
        // const vecDataPtr = this.lib.get_vector_data(idPtr);
        // return this.lib.get_array(vecDataPtr, { type: "double", len: this.getVecLen(id) });
        throw new Error("TODO");
    }

    public hasData() {
        return !!this.curPlotID;
    }

    public printData() {
        this.lib.print_data();
    }
}

