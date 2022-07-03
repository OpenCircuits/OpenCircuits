import path from "path";
import {mkdirSync, copyFileSync, readdirSync, existsSync} from "fs";


export default function copy_dir(dir, target) {
    if (!existsSync(target))
        mkdirSync(target, { recursive: true });

    const files = readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        const p1 = path.resolve(dir, file.name);
        const p2 = path.resolve(target, file.name);

        if (file.isFile())
            copyFileSync(p1, p2);
        else // Subdirectory
            copy_dir(p1, p2);
    }
}
