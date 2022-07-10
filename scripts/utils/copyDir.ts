import {copyFileSync, existsSync, mkdirSync, readdirSync} from "node:fs";
import path                                               from "node:path";


export default function CopyDir(dir: string, target: string) {
    if (!existsSync(target))
        mkdirSync(target, { recursive: true });

    const files = readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        const p1 = path.resolve(dir, file.name);
        const p2 = path.resolve(target, file.name);

        if (file.isFile())
            copyFileSync(p1, p2);
        else // Subdirectory
            CopyDir(p1, p2);
    }
}
