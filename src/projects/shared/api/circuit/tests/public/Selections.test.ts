/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "../Extensions";

import {V} from "Vector";

import {Circuit, Obj} from "shared/api/circuit/public";

import {CreateTestRootCircuit} from "tests/helpers/CreateTestCircuit";


// NOTE: For (most) of these, make sure the `SelectionsEvent` fires correctly
describe("Selections", () => {
    describe("Basic Queries", () => {
        // Test ideas:
        // .length / .isEmpty
        // .all
        // .filter (don't have to do anything crazy)
        // .every (don't have to do anything crazy)
    });

    describe("Obj Queries", () => {
        // Test ideas:
        // .all
        // .components filters correctly
        // .wires filters correctly
    });

    describe("Midpoint", () => {
        // Test ideas:
        // Will have to do some math (don't have to do anything crazy)
    });

    describe("Clear", () => {
        // Test ideas:
        // Make sure undo/redo works for this
    });

    describe("Duplicate", () => {
        // Test ideas:
        // Make sure undo/redo works for this
    });
});
