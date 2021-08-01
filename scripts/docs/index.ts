import fs from "fs";
import path from "path";
import {ts, Node, Project, ScriptTarget, ModuleKind} from "ts-morph";

import {Class, TSDoc} from "./model";
import {parseClass, parseMethods} from "./parse";
import {generateMD} from "./display";
import {getUniquePaths} from "./utils";


function generateDocumentation(fileNames: string[], outPath: string, compilerOptions: ts.CompilerOptions) {
    const project = new Project({ compilerOptions });
    project.addSourceFilesAtPaths(fileNames);

    const docs: TSDoc[] = [];

    for (const srcFile of project.getSourceFiles()) {
        docs.push({
            file: srcFile.getFilePath(),
            fileName: srcFile.getBaseName(),
            classes: srcFile.getClasses().map(parseClass),
            functions: parseMethods(srcFile.getFunctions()),
        });
    }

    // If a class with the same name as the file is within the list of classes, then move to top so it displays first
    docs.forEach(doc => {
        const i = doc.classes.map(c => c.name).indexOf(doc.fileName.split(".")[0]);
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

    for (let i = 0; i < docs.length; i++) {
        const doc = docs[i];

        // Dir if it doesn't exist
        if (!fs.existsSync(path.resolve(outPath)))
            fs.mkdirSync(path.resolve(outPath), { recursive: true });

        const md = generateMD(doc);
        fs.writeFileSync(path.resolve(outPath, doc.fileName.split(".")[0] + ".md"), md);
        // console.log(path.relative(process.cwd(), doc.file));
    }

    // const names = classes.map(c => c.fileName);
    // const uniqueNames = getUniquePaths(names);

    // for (let i = 0; i < classes.length; i++) {
    //     const c = classes[i];
    //     const name = names[i];//uniqueNames[i].slice(1); // Remove leading '/'
    //     const split = name.split("/");
    //     const fileName = split[split.length-1];
    //     const dir = split.slice(0, split.length-1).join("/");

    //     // Dir if it doesn't exist
    //     if (!fs.existsSync(path.resolve(outPath, dir)))
    //         fs.mkdirSync(path.resolve(outPath, dir), { recursive: true });

    //     const md = generateMD(c);
    //     fs.writeFileSync(path.resolve(outPath, dir, fileName.slice(0, fileName.length-3)+".md"), md);
    // }
}


generateDocumentation(["src/app/core/utils/math/Graph.ts"], "docs/ts/app/core/utils/tmp", {
    target: ScriptTarget.ES5,
    module: ModuleKind.ESNext,
    lib: [
        "dom",
        "dom.iterable",
        "esnext"
    ]
});
