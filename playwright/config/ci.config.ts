import baseConfig from "./base.config.js";


import type {PlaywrightTestConfig, PlaywrightTestOptions, PlaywrightWorkerOptions, Project} from "@playwright/test";


function modifiyTestMatchString(match: string, page: string): string {
    return match.replace("*", "*/" + page);
}
function modifiyTestMatchRegExp(match: RegExp, _page: string): RegExp {
    // TODO: Figure out how to actually do this
    return match;
}

type PageNames = "digital" | "landing";
type PageDetails = {
    port: number;
    command: string;
}

const pages: Readonly<Record<PageNames, PageDetails>> = {
    digital: {
        port:    8080,
        command: "node ./build/scripts/build.js server digital " +
                 "&& node ./build/scripts/start.js --project=server",
    },
    landing: {
        port:    3000,
        command: "node ./build/scripts/start.js --project=landing",
    },
};

const projects: Array<Project<PlaywrightTestOptions, PlaywrightWorkerOptions>> = [];
baseConfig.projects?.forEach((project) => {
    Object.entries(pages).forEach(([page, { port }]) => {
        const name = project.name + "-" + page;
        let testMatch: string | RegExp | Array<string | RegExp> | undefined;
        if (project.testMatch === undefined) {
            testMatch = undefined;
        } else if (typeof project.testMatch === "string") {
            testMatch = modifiyTestMatchString(project.testMatch, page);
        } else if (project.testMatch instanceof RegExp) {
            testMatch = modifiyTestMatchRegExp(project.testMatch, page);
        } else {
            testMatch = project.testMatch.map((matcher) =>
                typeof matcher === "string"
                    ? modifiyTestMatchString(matcher, page)
                    : modifiyTestMatchRegExp(matcher, page))
        }
        const projectOverrides = {
            name,
            testMatch,
            use: { ...project.use, baseUrl: `http://localhost:${port}` },
        }
        projects.push({ ...project, ...projectOverrides });
    });
});

const webServer = Object.values(pages).map(({ port, command }) => ({
    reuseExistingServer: true,
    timeout:             120_000,
    command:             `cd ../../ && ${command}`,
    port,
}));

// 8080 for digital prod
// Generate snapshots through the dev version
const overrides: PlaywrightTestConfig = {
    testDir: "../",

    webServer,

    projects,
}

const config: PlaywrightTestConfig = { ...baseConfig, ...overrides };

export default config;
