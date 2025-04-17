import {Vector} from "Vector";

import {Curve} from "math/Curve";
import {Transform}   from "math/Transform";

import {GUID}  from "..";
import {Prim} from "./Prim";


export interface PortPos {
    origin: Vector;
    target: Vector;
    dir: Vector;
}

export class DepthList<K> {
    private depths: number[];
    private values: K[];
    private curLen: number;

    // Value : index in the array
    private readonly map: Map<K, number>;

    private isDirty: boolean;

    public constructor() {
        this.depths = [];
        this.values = [];
        this.curLen = 0;
        this.map = new Map();
        this.isDirty = false;
    }

    private sort() {
        if (!this.isDirty)
            return;

        for (let i = 1; i < this.depths.length; i++) {
            const cur = this.depths[i], curVal = this.values[i];
            let j = i - 1;
            while (j >= 0 && this.depths[j] > cur) {
                this.depths[j + 1] = this.depths[j];
                this.values[j + 1] = this.values[j];
                j--;
            }
            this.depths[j + 1] = cur;
            this.values[j + 1] = curVal;
        }

        // Then update index map and stop when finding Infinity (deleted elements)
        let deletedElsStartIndex = this.depths.length;
        for (let i = 0; i < this.depths.length; i++) {
            if (this.depths[i] >= Infinity) {
                deletedElsStartIndex = i;
                break;
            }
            this.map.set(this.values[i], i);
        }

        // Splice off any deleted elements
        this.depths.splice(deletedElsStartIndex, this.depths.length - deletedElsStartIndex);
        this.values.splice(deletedElsStartIndex, this.values.length - deletedElsStartIndex);

        this.curLen = this.depths.length;

        this.isDirty = false;
    }

    public clear(): void {
        this.depths = [];
        this.values = [];
        this.curLen = 0;
        this.map.clear();
        this.isDirty = false;
    }

    public set(val: K, depth: number) {
        if (this.map.has(val)) {
            const idx = this.values.indexOf(val);
            this.depths[idx] = depth;
            this.values[idx] = val;
        } else {
            this.depths.push(depth);
            this.values.push(val);
            this.curLen++;
        }
        this.isDirty = true;
    }

    public delete(val: K): boolean {
        if (!this.map.has(val))
            return false;
        const idx = this.map.get(val)!;

        this.curLen--;
        this.map.delete(val);

        // As a performance optimization:
        //  Instead of splicing (very slow), set depth to
        //  Infinity and then after sorting, slice them off.
        this.depths[idx] = Infinity;

        this.isDirty = true;

        return true;
    }

    public at(i: number): K | undefined {
        this.sort();  // (if dirty)
        return this.values.at(i);
    }

    public get highestDepth(): number {
        this.sort();
        return this.depths.at(-1) ?? 0;
    }

    public get length(): number {
        return this.curLen;
    }

    public forEach(fn: (val: K, depth: number, i: number) => void) {
        this.sort();  // (if dirty)
        for (let i = 0; i < this.length; i++)
            fn(this.values[i], this.depths[i], i);
    }

    public *[Symbol.iterator]() {
        this.sort();  // (if dirty)
        for (let i = 0; i < this.length; i++)
            yield this.values[i];
    }
}

export interface AssemblyCache {
    componentTransforms: Map<GUID, Transform>;
    componentPrims: Map<GUID, Prim[]>;

    componentOrder: DepthList<GUID>;

    localPortPositions: Map<GUID, PortPos>;  // Key'd by port ID
    portPositions: Map<GUID, PortPos>;       // Key'd by port ID
    portPrims: Map<GUID, Map<GUID, Prim[]>>; // Key'd by component parent, then by port ID
    portLabelPrims: Map<GUID, Prim[]>;       // Key'd by component parent

    wireCurves: Map<GUID, Curve>;
    wirePrims: Map<GUID, Prim[]>;

    // wireOrder: {
    //     ids: GUID[];
    //     map: Map<GUID, number>;
    // };
}

export type ReadonlyAssemblyCache = {
    [T in keyof AssemblyCache]: AssemblyCache[T] extends Map<infer K, infer V>
        ? ReadonlyMap<K, Readonly<V>>
        : Readonly<AssemblyCache[T]>;
}
