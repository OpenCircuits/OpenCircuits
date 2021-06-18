const path = require("path");
const {readdirSync, readFileSync, existsSync} = require("fs");


module.exports = function getDirs() {
    const pagesDir = "src/site/pages";
    const dirs = readdirSync(pagesDir, { withFileTypes: true });

    // Get all directories in `src/site/pages`
    let pageDirs = [];
    for (const dir of dirs) {
        if (!dir.isDirectory())
            continue;

        // Check for package.json
        const packagePath = path.resolve(pagesDir, dir.name, "package.json");
        if (!existsSync(packagePath))
            continue;

        const {description} = JSON.parse(readFileSync(packagePath, "utf-8"));

        pageDirs.push({
            title: (dir.name[0].toUpperCase() + dir.name.slice(1).toLowerCase()),
            description,
            value: dir.name,
        });
    }


    return [
        { // Add in server directory
            title: "Server", description: "The backend server for OpenCircuits", value: "server",
        },
        ...pageDirs,
    ];
}
