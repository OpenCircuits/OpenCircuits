import {ESLint}    from "eslint";
import {simpleGit} from "simple-git";
import yargs       from "yargs";


// CLI
(async () => {
    const { fix, cache, all } = await yargs(process.argv.slice(2))
        .boolean("fix")
        .boolean("cache")
        .boolean("all")
        .argv;

    const eslint = new ESLint({
        fix, cache,
        errorOnUnmatchedPattern: false, // disable because deleted files
        extensions:              [".ts", ".tsx"],
    });

    const files: string[] = [];
    if (!all) {
        const git = simpleGit();
        const diff = await git.diff(["--name-only", "master...HEAD"]);
        diff.split("\n").filter((file) => (file.endsWith(".ts") || file.endsWith(".tsx"))).forEach((file) => {
            if (file.endsWith(".ts") || file.endsWith(".tsx"))
                files.push(file);
        });
        const status = await git.status(["--short"]);
        status.files.forEach((summary) => {
            const file = summary.path;
            if (file.endsWith(".ts") || file.endsWith(".tsx"))
                files.push(file);
        });
    } else {
        files.push("scripts/", "src/");
    }

    const results = await eslint.lintFiles(files);
    if (fix)
        await ESLint.outputFixes(results);
    const formatter = await eslint.loadFormatter("stylish");
    const resultText = formatter.format(results);
    console.log(resultText);
})();
