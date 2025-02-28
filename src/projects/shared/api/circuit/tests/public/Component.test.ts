/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "../Extensions";

import {V} from "Vector";

import {Circuit, Obj} from "shared/api/circuit/public";

import {CreateTestRootCircuit} from "tests/helpers/CreateTestCircuit";


describe("Component", () => {
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