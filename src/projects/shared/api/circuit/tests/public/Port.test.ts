/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "tests/helpers/Extensions";

import {V} from "Vector";

import {Circuit, Obj} from "shared/api/circuit/public";

import {CreateTestRootCircuit} from "tests/helpers/CreateTestCircuit";


describe("Port", () => {
    describe("Bounds", () => {
        // Test ideas:
        // Check bounds for test circuit and make sure they're right
        // Bounds for port should include the stick + the circle
    });

    describe("Name", () => {
        // Test ideas:
        // Make sure default is undefined
        // Setting name and undoing brings it back to undefined
    });

    describe("isSelected", () => {
        // Test ideas:
        // setting directly and using select/deselect all work
        // Undoing should undo it
    });

    describe("zIndex", () => {
        // Idk yet, not sure we even want to expose this
    });

    describe("Exists", () => {
        // Test ideas:
        // Returns true when added
        // Returns false when undoing an add
        // Returns false when deleted
    });

    describe("Props", () => {
        // Test ideas:
        // For port should all have name/zIndex
        // Setting an invalid prop should error
        // Getting an invalid prop should return undefined
    });

    describe("Info", () => {
        // Test ideas:
        // Make sure the port has the correct `parent`, `group`, `index`
    });

    describe("Position", () => {
        // Test ideas:
        // Check origin/target pos and direction
        // Make sure to also do one where you move/rotate the parent component
    });

    describe("Connections", () => {
        // Test ideas:
        // Connect some wires (using `connectTo`) and expect `connections` to return correctly
        // ^ Same thing with `connectedPorts` (feel free to steal from projects/digital/api/circuit/tests/Port.test.ts)
    });

    // TODO: Do we even want this in the API
    // describe("Path", () => {
    //     ///
    // });

    describe("Get Legal Wires", () => {
        // Test ideas:
        // Not very useful here but just make sure you can always connect to any port (including itself)
        // (will be more useful in digital context)
    });
});
