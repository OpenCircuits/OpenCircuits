// TODO: Find out why Camera is being ignored and requiring a manual import
import "math/Camera";

import {Circuit} from "core/models/Circuit";

import {VersionConflictResolver} from "digital/utils/DigitalVersionConflictResolver";

import "digital/models/ioobjects";

import {LoadCircuit} from "./CircuitLoadingUtils";

import v1_1everythingJson from "./saves/v1.1_everything.json";
import v1_1muxesJson      from "./saves/v1.1_muxes.json";
import v2_1everythingJson from "./saves/v2.1_everything.json";
import v2_1muxesJson      from "./saves/v2.1_muxes.json";
import v3_0propsJson      from "./saves/v3.0_misc_properties.json";
import v3_1propsJson      from "./saves/v3.1_misc_properties.json";


// TODO: add save 3 test for v3.1, also find out why it fails to load it


describe("Save Migration Tests", () => {
    describe("v1.1 -> v2.1", () => {
        test("Save 1 - Muxes / ANDGates", () => {
            // Load old version
            VersionConflictResolver(v1_1muxesJson as Circuit);
            const circuit1 = LoadCircuit(v1_1muxesJson);
            expect.anything();

            // Load current version
            VersionConflictResolver(v2_1muxesJson as Circuit);
            const circuit2 = LoadCircuit(v2_1muxesJson);
            expect(circuit1).toMatchCircuit(circuit2);
        });
        test("Save 2 - All Components", () => {
            // Load old version
            VersionConflictResolver(v1_1everythingJson as Circuit);
            const circuit1 = LoadCircuit(v1_1everythingJson);
            expect.anything();

            // Load current version
            VersionConflictResolver(v2_1everythingJson as Circuit);
            const circuit2 = LoadCircuit(v2_1everythingJson);
            expect(circuit1).toMatchCircuit(circuit2);
        });
    });

    describe("v3.0 -> v3.1", () => {
        test("Save 1 - Misc. Properties", () => {
            // Load old version
            VersionConflictResolver(v3_0propsJson as Circuit);
            const circuit1 = LoadCircuit(v3_0propsJson);
            expect.anything();

            // Load current version
            VersionConflictResolver(v3_1propsJson as Circuit);
            const circuit2 = LoadCircuit(v3_1propsJson);
            expect(circuit1).toMatchCircuit(circuit2);
        });
    });
});
