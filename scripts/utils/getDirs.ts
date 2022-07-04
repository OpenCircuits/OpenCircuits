import path from "path";
import {readdirSync, readFileSync, existsSync} from "fs";

import type {Choice} from "prompts";


/**
 * @param includeServer Whether or not to include the `server` folder
 * @param includeApp Whether or not to include the `app` folder
 * @returns The directories of the format for presentation using `prompts`
 */
export default function getDirs(includeServer: boolean, includeApp: boolean): Choice[] {
    const pagesDir = "src/site/pages";
    const dirs = readdirSync(pagesDir, { withFileTypes: true });

    // Get all directories in `src/site/pages`
    const pageDirs = dirs
        // Filter out directories
        .filter(dir => dir.isDirectory())
        // Get package.json paths
        .map(dir => [dir, path.resolve(pagesDir, dir.name, "package.json")] as const)
        // Filter out non-package.json-containing directories
        .filter(([_, packagePath]) => existsSync(packagePath))
        // Map to prompt formats
        .map(([dir, packagePath]) => ({
            title: (dir.name[0].toUpperCase() + dir.name.slice(1).toLowerCase()),
            description: JSON.parse(readFileSync(packagePath, "utf-8")).description,
            value: dir.name,
        }));

    return [
        ...(includeServer ? [{ // Add in server directory
            title: "Server", description: "The backend server for OpenCircuits", value: "server",
        }] : []),
        ...(includeApp ? [{ // Add in app directory
            title: "App", description: "The application logic for OpenCircuits", value: "app",
        }] : []),
        ...pageDirs,
    ];
}
