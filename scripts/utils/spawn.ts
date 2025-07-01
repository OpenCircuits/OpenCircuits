import {SpawnOptions, spawn} from "node:child_process";


export function Spawn(cmd: string, opts?: SpawnOptions) {
    return new Promise<void>((resolve, reject) => {
        spawn(cmd, opts)
            .on("exit", () => resolve())
            .on("error", (err) => reject(err));
    });
}
