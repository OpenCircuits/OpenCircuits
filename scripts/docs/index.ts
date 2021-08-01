import fs from "fs";
import path from "path";
import {ts, Node, Project, ScriptTarget, ModuleKind} from "ts-morph";

import {Class} from "./model";
import {parseClass} from "./parse";
import {generateMD} from "./display";
import {getUniquePaths} from "./utils";


function generateDocumentation(fileNames: string[], outPath: string, compilerOptions: ts.CompilerOptions) {
    const project = new Project({ compilerOptions });
    project.addSourceFilesAtPaths(fileNames);

    const classes: Class[] = [];

    for (const srcFile of project.getSourceFiles()) {
        srcFile.forEachChild(c => {
            if (Node.isClassDeclaration(c)) {
                console.log("class:", c.getName());
                classes.push(parseClass(c));
                // console.log(classes[classes.length-1]);
            } else if (Node.isFunctionDeclaration(c)) {
                // console.log("function:", c.getName());
                // TODO
            }
        });
    }

    // Create output dir if it doesn't exist
    if (!fs.existsSync(path.resolve(outPath)))
        fs.mkdirSync(path.resolve(outPath), { recursive: true });

    const names = classes.map(c => c.fileName);
    const uniqueNames = getUniquePaths(names);

    for (let i = 0; i < classes.length; i++) {
        const c = classes[i];
        const name = names[i];//uniqueNames[i].slice(1); // Remove leading '/'
        const split = name.split("/");
        const fileName = split[split.length-1];
        const dir = split.slice(0, split.length-1).join("/");

        // Dir if it doesn't exist
        if (!fs.existsSync(path.resolve(outPath, dir)))
            fs.mkdirSync(path.resolve(outPath, dir), { recursive: true });

        const md = generateMD(c);
        fs.writeFileSync(path.resolve(outPath, dir, fileName.slice(0, fileName.length-3)+".md"), md);
    }
}


generateDocumentation(["src/app/core/utils/math/Vector.ts"], "docs/ts/app/core/utils/tmp", {
    target: ScriptTarget.ES5,
    module: ModuleKind.ESNext,
    lib: [
        "dom",
        "dom.iterable",
        "esnext"
    ]
});
