
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

    public createNode(value: V) {
        if (this.list.has(value))
            throw new Error("Graph already has value: " + value);

        this.list.set(value, []);
        this.reverseList.set(value, []);
    }

    public createEdge(source: V, target: V, weight: E) {
        if (!this.list.has(source))
            throw new Error("Graph doesn't have node of value: " + source);
        if (!this.list.has(target))
            throw new Error("Graph doesn't have node of value: " + target);

        this.list.get(source).push(new Edge<V,E>(target, weight));
        this.reverseList.get(target).push(new Edge<V,E>(source, weight));
    }

    private getFirstConnectedNode(list: Map<V, Edge<V, E>[]>): V {
        let it = list.entries();
        for (let i of it) {
            if (i[1].length > 0)
                return i[0];
        }
        return undefined;
    }

    private dfs(list: Map<V, Edge<V, E>[]>, visited: Map<V, boolean>, v: V) {
        visited.set(v, true);

        // Recursively visit each edge
        for (let e of list.get(v)) {
            let target = e.getTarget();
            if (!visited.has(target))
                this.dfs(list, visited, target);
        }
    }

    public isConnected(): boolean {
        if (this.list.size <= 1)
            return true;
        let first  = this.getFirstConnectedNode(this.list);
        let rfirst = this.getFirstConnectedNode(this.reverseList);

        if (first == undefined || rfirst == undefined)
            return false;

        let visited = new Map<V, boolean>();

        // DFS through regular and reverse edge lists
        this.dfs(this.list, visited, first);
        this.dfs(this.reverseList, visited, rfirst);

        // Check if every node was visited
        return visited.size == this.size();
    }

    public size(): number {
        return this.list.size;
    }

    public getConnections(value: V): Edge<V, E>[] {
        return this.list.get(value);
    }

    public getNodes(): V[] {
        let nodes = [];
        for (let val of this.list.keys())
            nodes.push(val);
        return nodes;
    }

}
