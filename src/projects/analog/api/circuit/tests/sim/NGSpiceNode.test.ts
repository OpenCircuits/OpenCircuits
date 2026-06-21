/**
 * @jest-environment node
 */
import { CreateWASMInstance } from "../../../../site/src/sim/lib/WASM";
import { NGSpiceLib } from "../../../../site/src/sim/lib/NGSpiceLib";

const initNGSpice = require("./lib/ngspice_node.js");

describe("NGSpice Node WASM", () => {
    it("should load, initialize, and run a simple netlist", async () => {
        // Init NGSpice WASM module
        const module = await initNGSpice() as NGSpiceLib;
        const lib = CreateWASMInstance(module);
        expect(lib).toBeDefined();
        expect(typeof lib._OC_init).toBe("function");

        // Initialize NGSpice
        lib._OC_init();
        
        // Let's create a simple netlist to test
        const netlist = [
            ".title TestCircuit",
            "V1 1 0 DC 5",
            "R1 1 0 1000",
            ".op",
            ".end",
            "\0" // null terminator
        ];
        
        // Upload data to NGSpice
        const netlistPtrs = lib.create_str_array(netlist);
        lib._OC_set_data(netlistPtrs[0]);

        // Run NGSpice
        lib._OC_run();

        // Get plot IDs
        const plotIdsPtr = lib._OC_get_plot_ids();
        expect(plotIdsPtr).toBeTruthy();

        if (plotIdsPtr) {
            const plotIDPtrs = lib.get_array(plotIdsPtr, { type: "string*" }).slice(0, -1);
            const plotIDs = plotIDPtrs.map((ptr) => lib.get_array(ptr, { type: "char" }));
            
            // Should contain our op1 plot or similar
            expect(plotIDs.length).toBeGreaterThan(0);
            
            // Let's find the 'op1' or current plot
            const curPlotPtr = lib._OC_get_cur_plot();
            expect(curPlotPtr).toBeTruthy();
            const curPlotID = curPlotPtr ? lib.get_array(curPlotPtr, { type: "char" }) : "";
            
            expect(curPlotID).toBeTruthy();
        }

        // Clean up
        netlistPtrs.forEach((ptr) => lib.free_array(ptr));
    });
});
