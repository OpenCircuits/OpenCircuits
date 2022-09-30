

// build and run Docker install

import {execSync} from "node:child_process";
import path       from "node:path";


execSync("docker build -t ngspice:make .", {
    cwd:   path.resolve(process.cwd(), "scripts/ngspice"),
    stdio: "inherit",
});
execSync("docker run --rm -v $(pwd):/mnt ngspice:make", {
    cwd:   path.resolve(process.cwd(), "scripts/ngspice"),
    stdio: "inherit",
});
// execSync("docker build -t ngspice:make .");
