/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "tests/helpers/Extensions";

import {V} from "Vector";

import {Circuit, Obj} from "shared/api/circuit/public";

import {CreateTestRootCircuit} from "tests/helpers/CreateTestCircuit";


describe("Component", () => {
    describe("Bounds", () => {
        // Test ideas:
        // Bounds for the TestComp are 1x1 I think
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
        // For comp should all have name/zIndex/x/y/angle
        // Setting an invalid prop should error
        // Getting an invalid prop should return undefined
    });

    describe("Transform", () => {
        // Test ideas:
        // Making sure default x/y/pos/angle are 0s
        // Setting positions => getting position
        // Undo/redo settings positions
    });

    describe("isNode", () => {
        // Idk
    });

    describe("Ports", () => {
        // Test ideas:
        // Maybe make a new helper to create a circuit with a specific set of port groups
        // make sure `.ports` has the correct groups and number of ports in each group
        // make sure allPorts has the correct number of ports
        // in each of these you can `setNumPorts` as well maybe?
        // Also test firstAvailable in here
    });

    // TODO: Do we even want this in the API?
    // describe("Connected Components", () => {
    // });

    describe("Delete", () => {
        // Test ideas:
        // Deleting components and undoing it
    });
});