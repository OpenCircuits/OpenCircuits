import "jest";

import {Graph} from "math/Graph";


describe("Graph", () => {
    describe("isConnected", () => {
        it("Test 1", () => {
            const graph = new Graph<string, string>();

            graph.createNode("a");
            graph.createNode("b");
            graph.createNode("c");
            graph.createNode("d");

            graph.createEdge("a", "c", "edge1");
            graph.createEdge("b", "c", "edge2");
            graph.createEdge("c", "d", "edge3");

            expect(graph.isConnected()).toBe(true);
        });
        it("Test 2", () => {
            const graph = new Graph<string, string>();

            // Full-Adder
            graph.createNode("A");
            graph.createNode("B");
            graph.createNode("Cin");

            graph.createNode("xor1");
            graph.createNode("xor2");
            graph.createNode("and1");
            graph.createNode("and2");
            graph.createNode("or1");

            graph.createNode("S");
            graph.createNode("Cout");

            graph.createEdge("A", "xor1", "edge");
            graph.createEdge("A", "and1", "edge");

            graph.createEdge("B", "xor1", "edge");
            graph.createEdge("B", "and1", "edge");

            graph.createEdge("Cin", "xor2", "edge");
            graph.createEdge("Cin", "and2", "edge");

            graph.createEdge("xor1", "xor2", "edge");
            graph.createEdge("xor1", "and2", "edge");

            graph.createEdge("xor2", "S", "edge");

            graph.createEdge("and1", "or1", "edge");
            graph.createEdge("and2", "or1", "edge");

            graph.createEdge("or1", "Cout", "edge");

            expect(graph.isConnected()).toBe(true);
        });
    });
});
