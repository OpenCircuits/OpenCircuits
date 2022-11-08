import {Graph} from "math/Graph";


function compareDepths(expected: string[][], actual: string[][]): boolean {
    if (actual.length !== expected.length)
        return false;
    for (const [i, element] of actual.entries()) {
        if (element.sort().join("") !== expected[i].sort().join(""))
            return false;
    }
    return true;
}

describe("Graph", () => {
    describe("isConnected", () => {
        test("Test 1", () => {
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
        test("Test 2", () => {
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

    describe("getMaxNodeDepths", () => {
        test("Single Node graph", () => {
            const graph = new Graph<string, string>();

            graph.createNode("A");

            const nodeDepths = graph.getMaxNodeDepths();

            const expected = [["A"]];
            expect(compareDepths(expected, nodeDepths)).toBeTruthy();
        });
        test("Simple graph", () => {
            const graph = new Graph<string, string>();

            graph.createNode("A");
            graph.createNode("B");
            graph.createNode("C");
            graph.createNode("D");

            graph.createEdge("A", "B", "edge");
            graph.createEdge("A", "D", "edge");
            graph.createEdge("B", "C", "edge");

            const nodeDepths = graph.getMaxNodeDepths();

            const expected = [
                ["A"],
                ["B", "D"],
                ["C"],
            ];
            expect(compareDepths(expected, nodeDepths)).toBeTruthy();
        });
        test("Multisource graph", () => {
            const graph = new Graph<string, string>();

            graph.createNode("A");
            graph.createNode("B");
            graph.createNode("C");
            graph.createNode("D");
            graph.createNode("E");
            graph.createNode("F");

            graph.createEdge("A", "C", "edge");
            graph.createEdge("B", "C", "edge");
            graph.createEdge("C", "D", "edge");
            graph.createEdge("A", "E", "edge");
            graph.createEdge("B", "F", "edge");

            const nodeDepths = graph.getMaxNodeDepths();

            const expected = [
                ["A", "B"],
                ["C", "E", "F"],
                ["D"],
            ];
            expect(compareDepths(expected, nodeDepths)).toBeTruthy();
        });
        test("Advanced graph", () => {
            const graph = new Graph<string, string>();

            graph.createNode("A");
            graph.createNode("B");
            graph.createNode("C");
            graph.createNode("D");
            graph.createNode("E");
            graph.createNode("F");
            graph.createNode("G");

            graph.createEdge("A", "C", "edge");
            graph.createEdge("A", "F", "edge");
            graph.createEdge("C", "F", "edge");
            graph.createEdge("C", "D", "edge");
            graph.createEdge("F", "G", "edge");
            graph.createEdge("D", "E", "edge");
            graph.createEdge("B", "E", "edge");
            graph.createEdge("E", "G", "edge");

            const nodeDepths = graph.getMaxNodeDepths();

            const expected = [
                ["A", "B"],
                ["C"],
                ["D", "F"],
                ["E"],
                ["G"],
            ];
            expect(compareDepths(expected, nodeDepths)).toBeTruthy();
        });
    });

    describe("getMinNodeDepths", () => {
        test("Single Node graph", () => {
            const graph = new Graph<string, string>();

            graph.createNode("A");

            const nodeDepths = graph.getMinNodeDepths();

            const expected = [["A"]];
            expect(compareDepths(expected, nodeDepths)).toBeTruthy();
        });
        test("Simple graph", () => {
            const graph = new Graph<string, string>();

            graph.createNode("A");
            graph.createNode("B");
            graph.createNode("C");
            graph.createNode("D");

            graph.createEdge("A", "B", "edge");
            graph.createEdge("A", "D", "edge");
            graph.createEdge("B", "C", "edge");

            const nodeDepths = graph.getMinNodeDepths();

            const expected = [
                ["A"],
                ["B", "D"],
                ["C"],
            ];
            expect(compareDepths(expected, nodeDepths)).toBeTruthy();
        });
        test("Multisource graph", () => {
            const graph = new Graph<string, string>();

            graph.createNode("A");
            graph.createNode("B");
            graph.createNode("C");
            graph.createNode("D");
            graph.createNode("E");
            graph.createNode("F");

            graph.createEdge("A", "C", "edge");
            graph.createEdge("B", "C", "edge");
            graph.createEdge("C", "D", "edge");
            graph.createEdge("A", "E", "edge");
            graph.createEdge("B", "F", "edge");

            const nodeDepths = graph.getMinNodeDepths();

            const expected = [
                ["A", "B"],
                ["C", "E", "F"],
                ["D"],
            ];
            expect(compareDepths(expected, nodeDepths)).toBeTruthy();
        });
        test("Advanced graph", () => {
            const graph = new Graph<string, string>();

            graph.createNode("A");
            graph.createNode("B");
            graph.createNode("C");
            graph.createNode("D");
            graph.createNode("E");
            graph.createNode("F");
            graph.createNode("G");

            graph.createEdge("A", "C", "edge");
            graph.createEdge("A", "F", "edge");
            graph.createEdge("C", "F", "edge");
            graph.createEdge("C", "D", "edge");
            graph.createEdge("F", "G", "edge");
            graph.createEdge("D", "E", "edge");
            graph.createEdge("B", "E", "edge");
            graph.createEdge("E", "G", "edge");

            const nodeDepths = graph.getMinNodeDepths();

            const expected = [
                ["A", "B"],
                ["C", "F", "E"],
                ["D", "G"],
            ];
            expect(compareDepths(expected, nodeDepths)).toBeTruthy();
        });
    });
});
