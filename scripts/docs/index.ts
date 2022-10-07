import fs   from "node:fs";
import path from "node:path";

import {ModuleKind, Project, ScriptTarget, ts} from "ts-morph";

import {generateMD}               from "./display.js";
import {parseClass, parseMethods} from "./parse.js";
import {getAllFiles}              from "./utils.js";

import type {TSDoc} from "./model";


function generateDocumentation(fileNames: string[], outPath: string, compilerOptions: ts.CompilerOptions) {
    const project = new Project({ compilerOptions });
    project.addSourceFilesAtPaths(fileNames);

    const docs: TSDoc[] = [];

    for (const srcFile of project.getSourceFiles()) {
        try {
            docs.push({
                file:      srcFile.getFilePath(),
                fileName:  srcFile.getBaseName(),
                classes:   srcFile.getClasses().map(parseClass),
                functions: parseMethods(srcFile.getFunctions()),
            });
        } catch (e) {
            console.error(`Failed to parse file: ${srcFile.getBaseName()}`);
            throw e;
        }
    }

    // If a class with the same name as the file is within the list of classes, then move to top so it displays first
    docs.forEach((doc) => {
        const i = doc.classes.map((c) => c.name).indexOf(doc.fileName.split(".")[0]);
        if (i === -1 || i === 0)
            return;
        const c = doc.classes[i];
        // Move class from `i` to `0`
        doc.classes.splice(i, 1);
        doc.classes.splice(0, 0, c);
    });

    // Create output dir if it doesn't exist
    if (!fs.existsSync(path.resolve(outPath)))
        fs.mkdirSync(path.resolve(outPath), { recursive: true });

    // Export each doc
    docs.forEach((doc) => {
        const outDir = path.resolve(
            outPath,
            path.join(
                path.relative("src", path.relative(process.cwd(), doc.file)),
                ".."
            )
        );
        const outFile = path.resolve(outDir, doc.fileName.split(".")[0] + ".md");

        // Create dir if it doesn't exist
        if (!fs.existsSync(path.resolve(outDir)))
            fs.mkdirSync(path.resolve(outDir), { recursive: true });

        const md = generateMD(doc);
        fs.writeFileSync(outFile, md);
    });
}


const files = [
    ...getAllFiles(path.resolve("src/app/core")),
    ...getAllFiles(path.resolve("src/app/digital")),
];
generateDocumentation(files, "docs/ts/", {
    target: ScriptTarget.ES5,
    module: ModuleKind.ESNext,

    lib: [
        "dom",
        "dom.iterable",
        "esnext",
    ],
});
