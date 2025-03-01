/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "tests/helpers/Extensions";

import {V} from "Vector";

import {Circuit, Obj} from "shared/api/circuit/public";

import {CreateTestRootCircuit} from "tests/helpers/CreateTestCircuit";


describe("Wire", () => {
    describe("Bounds", () => {
        // Test ideas:
        // Check bounds for test circuit and make sure they're right
        //  > Wires you'll have to do some math but placing components horizontally and connecting them
        //  should lead to straightforward bounds
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
        // For wire should all have name/zIndex/color
        // Setting an invalid prop should error
        // Getting an invalid prop should return undefined
    });

    describe("Ports", () => {
        // Test ideas:
        // Make sure connected ports (p1, p2) are as expected
    });

    // TODO: Do we even want this in the API
    // describe("Path", () => {
    //     ///
    // });

    describe("Split", () => {
        // Test ideas:
        // Make sure split actually works, the wire that was "split" shouldn't exist afterwards (I think)
        //  (.exist return false)
        // Make sure undo/redo works
        // Undoing should make the original wire exist again
        // Make sure connected ports (p1, p2) are as expected throughout
    });

    describe("Delete", () => {
        // Test ideas:
        // Deleting wire should work and undo/redo
        // Deletion after splitting and stuff should be tested too
    });
});
