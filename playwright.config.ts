import baseConfig from "./playwright/config/digital.config.js";

import type {PlaywrightTestConfig} from "@playwright/test";


// Change the baseConfig import to change which test are run by default
const overrides: PlaywrightTestConfig = {
    testDir: baseConfig.testDir?.replace("../", "./playwright/"),

    webServer: !baseConfig.webServer ? undefined
        : Array.isArray(baseConfig.webServer) ? baseConfig.webServer.map((server) => ({ ...server, cwd: "" }))
        : { ...baseConfig.webServer, cwd: "" },

    projects: baseConfig.projects?.map((project) => ({ ...project, project: project.testDir?.replace("../", "") })),
}

const config: PlaywrightTestConfig = { ...baseConfig, ...overrides };

export default config;
