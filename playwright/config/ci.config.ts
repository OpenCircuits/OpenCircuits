import {existsSync} from "node:fs";

import minimatch from "minimatch";

import baseConfig, {DevProjects, DevWebServers, ProdProjects, ProdWebServers, type WebServer} from "./base.config.js";

import type {PlaywrightTestConfig, PlaywrightTestOptions, PlaywrightWorkerOptions, Project} from "@playwright/test";


type OSGithubName = "ubuntu-latest" | "windows-latest" | "macos-latest";
type OSNodeName =   "linux"         | "win32"          | "darwin";
const OSNames: Readonly<Record<OSGithubName, OSNodeName>> = {
    "ubuntu-latest":  "linux",
    "windows-latest": "win32",
    "macos-latest":   "darwin",
}


function isFileValid(testMatch: string | RegExp | Array<string | RegExp> | undefined, file: string): boolean {
    if (testMatch === undefined)
        return false;
    if (typeof testMatch === "string")
        return minimatch(file, testMatch);
    if (testMatch instanceof RegExp)
        return testMatch.test(file);
    return testMatch.some((matcher) => (isFileValid(matcher, file)));
}

function getMatchers(testMatch: string | RegExp | Array<string | RegExp> | undefined, list: string[]): string[] {
    return list
        .map((file) => (`playwright/${file}.spec.ts`))
        .filter((file) => existsSync(file))
        .map((file) => (`${process.cwd()}/${file}`))
        .filter((file) => isFileValid(testMatch, file));
}

function modifyProject(project: Project<PlaywrightTestOptions, PlaywrightWorkerOptions>, port: number, tests: string[]):
    Project<PlaywrightTestOptions, PlaywrightWorkerOptions> {
    return {
        ...project,
        testMatch: getMatchers(project.testMatch, tests),

        use: {
            ...project.use,
            baseURL: `http://localhost:${port}`,
        },
    }
}

function getSnapshotConfig(command: string): PlaywrightTestConfig {
    const args = command.split(" ");
    const digitalPort = 3000;
    const landingPort = 3001;

    if (args.length < 3) // At least one test must be specified
        return {};
    if (args[0] !== "/update-snapshots") // Correct command usage
        return {};

    const oses = args[1].split(",");
    if (!oses.some((os) => (process.platform === OSNames[os]))) // Run on this OS
        return {};

    const digitalProjects = DevProjects.digital.map((project) => modifyProject(project, 3000, args.slice(2)));
    const landingProjects = DevProjects.landing.map((project) => modifyProject(project, 3001, args.slice(2)));

    const webServer: WebServer[] = [];
    if (digitalProjects.some((project) => (!Array.isArray(project.testMatch) || project.testMatch.length > 0))) {
        webServer.push(
            {
                ...DevWebServers.digital,
                port:    digitalPort,
                command: `${DevWebServers.digital.command} --port=${digitalPort}`,
            }
        );
    }
    if (landingProjects.some((project) => (!Array.isArray(project.testMatch) || project.testMatch.length > 0))) {
        webServer.push(
            {
                ...DevWebServers.landing,
                port:    landingPort,
                command: `${DevWebServers.landing.command} --port=${landingPort}`,
            }
        );
    }

    if (webServer.length === 0) {
        return {};
    }

    return {
        testDir:  ".././",
        webServer,
        projects: [
            ...digitalProjects,
            ...landingProjects,
        ],
    };
}

let overrides: PlaywrightTestConfig = {};
if (process.env.UPDATE_SNAPSHOTS_COMMAND) {
    overrides = getSnapshotConfig(process.env.UPDATE_SNAPSHOTS_COMMAND);
    // If there are no tests to run, then exit safely.
    // Playwright normally exists with status code 1 if no tests are run.
    if (Object.keys(overrides).length === 0)
        // eslint-disable-next-line unicorn/no-process-exit
        process.exit(0);
} else {
    overrides = {
        testDir: ".././",

        webServer: [DevWebServers.landing, ProdWebServers.digital],

        projects: [...DevProjects.landing, ...ProdProjects.digital],
    }
}
// TODO: This should only use prod version once those all exist
// Generate snapshots through the dev version

const config: PlaywrightTestConfig = { ...baseConfig, ...overrides };

export default config;
