import fs from "fs";
import path from "path";


const EscapeCodes = {
    '<': 'lt',
    '>': 'gt',
    '{': '#123',
    '}': '#125',
} as Record<string, string>;
const EscapeRegex = new RegExp(`[${Object.keys(EscapeCodes).join("")}]`, "g");
export function escapeStr(str: string | undefined): string | undefined {
    if (!str)
        return undefined;
    return str.replace(EscapeRegex, (m) => {
        return `&${EscapeCodes[m]};`;
    });
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
