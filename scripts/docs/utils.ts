import fs   from "node:fs";
import path from "node:path";


const EscapeCodes = {
    "<": "lt",
    ">": "gt",
    "{": "#123",
    "}": "#125",
} as Record<string, string>;

const EscapeRegex = new RegExp(`[${Object.keys(EscapeCodes).join("")}]`, "g");

export function escapeStr(str: string | undefined): string | undefined {
    if (!str)
        return undefined;
    return str.replace(EscapeRegex, (m) => `&${EscapeCodes[m]};`);
}

export function getAllFiles(p: string): string[] {
    const dir = fs.readdirSync(path.resolve(p), { withFileTypes: true });
    if (!dir || dir.length === 0)
        return [];
    let files = [] as string[];
    for (const f of dir) {
        files = f.isDirectory()
            ? [...files, ...getAllFiles(path.resolve(p, f.name))]
            : [...files, path.resolve(p, f.name)];
    }
    return files;
}
