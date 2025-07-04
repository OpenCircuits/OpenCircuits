import {devices} from "@playwright/test";

import type {PlaywrightTestConfig, PlaywrightTestOptions, PlaywrightWorkerOptions, Project} from "@playwright/test";
import path from "node:path";


type DevPageNames = "digital" | "landing";
type ProdPageNames = "digital";
type PageDetails = {
    port: number;
    command: string;
}
// TODO: How do I just import the interface TestConfigWebServer from "@playwright/test"?
export type WebServer = {
    reuseExistingServer: boolean;
    timeout: number;
    command: string;
    port: number;
    cwd: string;
}

/* Configure projects for major browsers */
const baseProjects: Array<Project<PlaywrightTestOptions, PlaywrightWorkerOptions>> = [
    {
        name: "chromium",
        use:  {
            ...devices["Desktop Chrome"],
            viewport: { width: 1280, height: 720 },
        },
        testMatch: ["*/desktop/{shared,chromium}/*.spec.ts", "*/shared/*.spec.ts"],
    },

    {
        name: "firefox",
        use:  {
            ...devices["Desktop Firefox"],
            viewport: { width: 1280, height: 720 },
        },
        testMatch: ["*/desktop/{shared,firefox}/*.spec.ts", "*/shared/*.spec.ts"],
    },

    {
        name: "webkit",
        use:  {
            ...devices["Desktop Safari"],
            viewport: { width: 1280, height: 720 },
        },
        testMatch: ["*/desktop/{shared,webkit}/*.spec.ts", "*/shared/*.spec.ts"],
    },

    /* Test against mobile viewports. */
    {
        name: "Mobile Chrome",
        use:  {
            ...devices["Pixel 5"],
        },
        testMatch: ["*/mobile/{shared,android}/*.spec.ts", "*/shared/*.spec.ts"],
    },
    {
        name: "Mobile Safari",
        use:  {
            ...devices["iPhone 12"],
        },
        testMatch: ["*/mobile/{shared,iphone}/*.spec.ts", "*/shared/*.spec.ts"],
    },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: {
    //     channel: 'msedge',
    //   },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: {
    //     channel: 'chrome',
    //   },
    // },
];

function modifiyTestMatchString(match: string, page: string): string {
    return match.replace("*", "**/" + page);
}
function modifiyTestMatchRegExp(match: RegExp, _page: string): RegExp {
    // TODO: Figure out how to actually do this
    return match;
}

function generateProjectDefinition(pageName: string, port: number,
    project: Project<PlaywrightTestOptions, PlaywrightWorkerOptions>):
    Project<PlaywrightTestOptions, PlaywrightWorkerOptions> {
    const name = project.name + "-" + pageName;
    let testMatch: string | RegExp | Array<string | RegExp> | undefined;
    if (project.testMatch === undefined) {
        testMatch = undefined;
    } else if (typeof project.testMatch === "string") {
        testMatch = modifiyTestMatchString(project.testMatch, pageName);
    } else if (project.testMatch instanceof RegExp) {
        testMatch = modifiyTestMatchRegExp(project.testMatch, pageName);
    } else {
        testMatch = project.testMatch.map((matcher) =>
            typeof matcher === "string"
                ? modifiyTestMatchString(matcher, pageName)
                : modifiyTestMatchRegExp(matcher, pageName))
    }
    return {
        name,
        testMatch,
        use: { ...project.use, baseURL: `http://localhost:${port}` },
    }
}

function getProjectDefinitions(pageName: string, port: number):
    Array<Project<PlaywrightTestOptions, PlaywrightWorkerOptions>> {
    return baseProjects.map((project) => generateProjectDefinition(pageName, port, project));
}

const devPages: Readonly<Record<DevPageNames, PageDetails>> = {
    digital: {
        port:    3000,
        command: `node ./build/scripts/start.js --targetDir=${path.join("src", "projects", "digital", "site")}`,
    },
    landing: {
        port:    3000,
        command: `node ./build/scripts/start.js --targetDir=${path.join("src", "other", "pages", "landing")}`,
    },
}

const prodPages: Readonly<Record<ProdPageNames, PageDetails>> = {
    digital: {
        port:    8080,
        // server path is hardcoded with forward slash
        command: `node ./build/scripts/build.js src/server ${path.join("src", "projects", "digital", "site")} ` +
                 "&& node ./build/scripts/start.js --targetDir=src/server",
    },
}

export const DevProjects: Readonly<Record<DevPageNames,
    Array<Project<PlaywrightTestOptions, PlaywrightWorkerOptions>>>> = {
    digital: getProjectDefinitions("digital", devPages.digital.port),
    landing: getProjectDefinitions("landing", devPages.landing.port),
}

export const ProdProjects: Readonly<Record<ProdPageNames,
    Array<Project<PlaywrightTestOptions, PlaywrightWorkerOptions>>>> = {
    digital: getProjectDefinitions("digital", prodPages.digital.port),
}

export const DevWebServers: Readonly<Record<DevPageNames, WebServer>> = {
    digital: {
        reuseExistingServer: true,
        timeout:             150_000,
        command:             devPages.digital.command,
        port:                devPages.digital.port,
        cwd:                 "../../",
    },
    landing: {
        reuseExistingServer: true,
        timeout:             150_000,
        command:             devPages.landing.command,
        port:                devPages.landing.port,
        cwd:                 "../../",
    },
}

export const ProdWebServers: Readonly<Record<ProdPageNames, WebServer>> = {
    digital: {
        reuseExistingServer: !!process.env.CI,
        timeout:             250_000,
        command:             prodPages.digital.command,
        port:                prodPages.digital.port,
        cwd:                 "../../",
    },
}

/**
 * Read environment variables from file.
 * See https://github.com/motdotla/dotenv for more.
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration for more.
 */
const config: PlaywrightTestConfig = {
    testDir: "../",
    /* Maximum time one test can run for. */
    timeout: 30 * 10_000,
    expect:  {
        /**
         * Maximum time expect() should wait for the condition to be met.
         * For example in `await expect(locator).toHaveText();`.
         */
        timeout: 6000,
    },
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly:    !!process.env.CI,
    /* Retry on CI only */
    retries:       process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers:       process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter:      "html",

    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
        actionTimeout: 0,

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: "on-first-retry",

        launchOptions: {
            ignoreDefaultArgs: ["--hide-scrollbars"],
        },

        screenshot: "on-first-failure",
    },

    /* Folder for test artifacts such as screenshots, videos, traces, etc. */
    // outputDir: 'test-results/',
};

export default config;
