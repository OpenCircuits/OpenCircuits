import fs from "fs";
import path from "path";
import {ts} from "ts-morph";


/** True if this is visible outside this file, false otherwise */
export function isNodeExported(node: ts.Node): boolean {
    return (
        (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0 ||
        (!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile)
    );
}
export function ArrayFrom<A>(it: ts.Iterator<A>): A[] {
    let arr = [] as A[];
    let cur: ReturnType<ts.Iterator<A>["next"]>;
    while (!(cur = it.next()).done)
        arr.push(cur.value as A);
    return arr;
}

export function findCommonPath(files: string[]): string {
    const splitFiles = files.map(f => f.split("/"));
    for (let i = 0; i < splitFiles[0].length; i++) {
        for (const splits of splitFiles) {
            if (splits[i] !== splitFiles[0][i]) // If not match the 1st one, then not common, return
                return splits.slice(0, i).join("/");
        }
    }
    return files[0]; // All files are the same
}

export function getUniquePaths(files: string[]): string[] {
    const common = findCommonPath(files);
    return files.map(f => f.split(common)[1]);
}

export function getAllFiles(p: string): string[] {
    const dir = fs.readdirSync(path.resolve(p), { withFileTypes: true });
    if (!dir || dir.length === 0)
        return [];
    let files = [] as string[];
    for (const f of dir) {
        if (f.isDirectory())
            files = [...files, ...getAllFiles(path.resolve(p, f.name))];
        else
            files = [...files, path.resolve(p, f.name)];
    }
    return files;
}
