
export class Edge<V, E> {
    private target: V;
    private weight: E;

    public constructor(target: V, weight: E) {
        this.target = target;
        this.weight = weight;
    }

    public getTarget(): V {
        return this.target;
    }

    public getWeight(): E {
        return this.weight;
    }
}

export class Graph<V, E> {
    private list: Map<V, Edge<V, E>[]>;
    private reverseList: Map<V, Edge<V, E>[]>;

    public constructor() {
        this.list = new Map<V, Edge<V, E>[]>();
        this.reverseList = new Map<V, Edge<V, E>[]>();
    }

    private bfs(visited: Map<V, boolean>, v: V): void {
        if (visited.get(v))
            return;

        visited.set(v, true);
        this.list.get(v).forEach((e) => this.bfs(visited, e.getTarget()));
        this.reverseList.get(v).forEach((e) => this.bfs(visited, e.getTarget()));
    }

    public createNode(value: V): void {
        if (this.list.has(value))
            throw new Error("Graph already has value: " + value);

        this.list.set(value, []);
        this.reverseList.set(value, []);
    }

    public createEdge(source: V, target: V, weight: E): void {
        if (!this.list.has(source))
            throw new Error("Graph doesn't have node of value: " + source);
        if (!this.list.has(target))
            throw new Error("Graph doesn't have node of value: " + target);

        this.list.get(source).push(new Edge<V, E>(target, weight));
        this.reverseList.get(target).push(new Edge<V, E>(source, weight));
    }

    public isConnected(): boolean {
        if (this.list.size <= 1)
            return true;

        const v = this.list.keys().next().value;

        const visited = new Map<V, boolean>();
        this.bfs(visited, v);

        return (visited.size === this.size());
    }

    public getSources(): V[] {
        return this.getNodes().filter((n) => this.reverseList.get(n).length === 0);
    }

    public getSinks(): V[] {
        return this.getNodes().filter((n) => this.list.get(n).length === 0);
    }

    public getEndNodes(): V[] {
        // Get nodes that are sources/sinks
        return this.getSources().concat(this.getSinks());
    }

    public size(): number {
        return this.list.size;
    }

    public getDegree(node: V): number {
        return this.list.get(node).length + this.reverseList.get(node).length;
    }

    public getConnections(value: V): Edge<V, E>[] {
        return this.list.get(value);
    }

    public getNodes(): V[] {
        const nodes = [];
        for (const val of this.list.keys())
            nodes.push(val);
        return nodes;
    }

    /**
    * Used to get the max "depth" of each node where the source nodes have a depth of 0
    *  and each additional layer adds +1 to the depth. If a node has parents at multiple
    *  depths such as 1 and 3, then it inherits from the "deeper" one, so the node would
    *  have a depth of 4. This should only be called if the isConnected() is true and the
    *  graph is acyclic.
    *
    * @return a map where each key is each node and the value is the max depth of that node
    */
    public getMaxNodeDepths(): Map<V, number> {
        const sources = this.getSources();
        const ret = new Map<V, number>();

        let currentLayer = this.getSources();
        let nextLayer: V[] = [];

        for (const node of currentLayer) {
            ret.set(node, 0);
        }

        while (currentLayer.length != 0) {
            for (const node of currentLayer) {
                const nextDepth = ret.get(node) + 1;
                for (const next of this.list.get(node))  {
                    ret.set(next.getTarget(), nextDepth);
                    nextLayer.push(next.getTarget());
                }
            }
            currentLayer = nextLayer;
            nextLayer = [];
        }

        return ret;
    }

}
