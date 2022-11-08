import {execSync} from "node:child_process";
import path       from "node:path";

import CopyDir from "../utils/copyDir.js";


const pwd = path.resolve(process.cwd(), "scripts/ngspice");

// Build docker image and NGSpice
execSync("docker build -t ngspice:make .", {
    cwd:   pwd,
    stdio: "inherit",
});

// Run container w/ image to output the files
execSync(`docker run --rm -v ${pwd}:/mnt ngspice:make`, {
    cwd:   pwd,
    stdio: "inherit",
});

// Copy files to analog site
CopyDir(
    path.resolve(process.cwd(), "scripts/ngspice/build"),
    path.resolve(process.cwd(), "src/site/pages/analog/src/lib"),
);
