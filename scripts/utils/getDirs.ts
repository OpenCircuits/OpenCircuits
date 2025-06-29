import {existsSync, readFileSync, readdirSync} from "node:fs";
import path                                    from "node:path";


export interface DirInfo {
    name: string;
    title: string;
    description: string;
    path: string;
}

function getDirs(root: string, subpath: string, titleAppend = ""): DirInfo[] {
    // Get all directories in directories
    return readdirSync(root, { withFileTypes: true })
        .filter((dir) => (dir.isDirectory()))
        .map((dir) => dir.name)
        // Get full paths
        .map((projectName) => [
            projectName,
            path.join(root, projectName, subpath),
        ] as const)
        // Filter out non-package.json-containing directories
        .filter(([_, dir]) => existsSync(path.join(dir, "package.json")))
        // Map to prompt formats
        .map(([projectName, dir]) => ({
            name:        projectName,
            title:       (projectName[0].toUpperCase() + projectName.slice(1).toLowerCase()) + titleAppend,
            description: JSON.parse(readFileSync(path.join(dir, "package.json"), "utf8")).description,
            path:        dir,
        }));
}

export function getProjectSiteDirs(): DirInfo[] {
    return getDirs("src/projects", "site", " (Site)");
}
export function getProjectCircuitDirs(): DirInfo[] {
    return getDirs("src/projects", "api/circuit", " (API: Circuit)");
}
export function getProjectCircuitDesignerDirs(): DirInfo[] {
    return getDirs("src/projects", "api/circuitdesigner", " (API: CircuitDesigner)");
}

export function getServerDir(): DirInfo {
    return {
        name:        "server",
        title:       "Server",
        description: "The backend server for OpenCircuits",
        path:        "src/server",
    };
}

export function getOtherPageDirs(): DirInfo[] {
    return getDirs("src/other/pages", "", " (Site)");
}
