import {Netlist, NetlistToNGSpice} from "./Netlist";

import {NGSpiceLib} from "./lib/NGSpiceLib";
import {CreateWASMInstance} from "./lib/WASM";


const MakeInstance = (lib: NGSpiceLib) => CreateWASMInstance(lib);

export class AnalogSim {
    private lib: ReturnType<typeof MakeInstance>;

    private netlistPtrs: [number, ...number[]];

    public constructor(lib: NGSpiceLib) {
        this.lib = MakeInstance(lib);
    }

    public init() {
        this.lib.init();
    }

    public uploadNetlist(netlist: Netlist) {
        // If netlist already exists, free it
        if (this.netlistPtrs)
            this.netlistPtrs.forEach(ptr => this.lib.free_array(ptr));

        // Convert netlist to format for NGSpice
        const ngNetList = NetlistToNGSpice(netlist).map(line => line.join(" "));

        console.log(ngNetList.join("\n"));

        // Upload data to NGSpice
        this.netlistPtrs = this.lib.create_str_array(ngNetList);
        this.lib.set_data(this.netlistPtrs[0]);
    }

    public run() {
        this.lib.run();
    }

    public getPlotIDs(): string[] {
        const plotIDsPtr = this.lib.get_plot_ids();
        return this.lib.get_array(plotIDsPtr, { type: "string" });
    }

    public getCurPlotID(): string {
        const plotIDPtr = this.lib.get_cur_plot();
        return this.lib.get_array(plotIDPtr, { type: "char" });
    }

    public getVecIDs(plot = this.getCurPlotID()): string[] {
        const plotIDPtr = this.lib.create_array("string", plot);
        const vecIDsPtr = this.lib.get_vector_ids(plotIDPtr);
        return this.lib.get_array(vecIDsPtr, { type: "string" });
    }

    public getVecLen(id: string): number {
        const idPtr = this.lib.create_array("string", id);
        return this.lib.get_vector_len(idPtr);
    }

    public getVecData(id: string): number[] {
        const idPtr = this.lib.create_array("string", id);
        const vecDataPtr = this.lib.get_vector_data(idPtr);
        return this.lib.get_array(vecDataPtr, { type: "double", len: this.getVecLen(id) });
    }

    public getVecDataIm(id: string): { re: number, im: number }[] {
        // const idPtr = this.lib.create_array("string", id);
        // const vecDataPtr = this.lib.get_vector_data(idPtr);
        // return this.lib.get_array(vecDataPtr, { type: "double", len: this.getVecLen(id) });
        throw new Error("TODO");
    }

    public printData() {
        this.lib.print_data();
    }
}

