import { execSync } from "node:child_process";
import path from "node:path";

import CopyDir from "../utils/copyDir.ts";

const pwd = path.resolve(process.cwd(), "scripts/ngspice");

// Build docker image and NGSpice
execSync("docker build -t ngspice:make .", {
    cwd: pwd,
    stdio: "inherit",
});

// Run container w/ image to output the files
execSync(`docker run --rm -v ${pwd}:/mnt ngspice:make`, {
    cwd: pwd,
    stdio: "inherit",
});

// Copy files to analog site and analog api tests
CopyDir(
    path.resolve(process.cwd(), "scripts/ngspice/build/web"),
    path.resolve(process.cwd(), "src/projects/analog/site/src/sim/lib"),
);

CopyDir(
    path.resolve(process.cwd(), "scripts/ngspice/build/node"),
    path.resolve(process.cwd(), "src/projects/analog/api/circuit/tests/sim/lib"),
);
