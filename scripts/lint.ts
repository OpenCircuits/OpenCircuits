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

    const files = await (async () => {
        if (all)
            return ["scripts/", "src/"];
        const git = simpleGit();
        // Get diff for all files that are staged (or something)
        const diff = await git.diff(["--name-only", "origin/master...", "--"]);
        // Get status for all unstaged files (or something)
        const status = await git.status(["--short"]);
        return [
            ...new Set([
                ...diff.split("\n"),
                ...status.files.map(f => f.path),
            ].filter((file) => (file.endsWith(".ts") || file.endsWith(".tsx")))
        )];
    })();

    const results = await eslint.lintFiles(files);
    if (fix)
        await ESLint.outputFixes(results);
    const formatter = await eslint.loadFormatter("stylish");
    const resultText = formatter.format(results);
    console.log(resultText);
})();
