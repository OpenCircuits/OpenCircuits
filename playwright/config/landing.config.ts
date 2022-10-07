import baseConfig, {DevProjects, DevWebServers} from "./base.config.js";

import type {PlaywrightTestConfig} from "@playwright/test";


const overrides: PlaywrightTestConfig = {
    testDir: "../landing",

    webServer: DevWebServers.landing,

    projects: DevProjects.landing,
}

const config: PlaywrightTestConfig = { ...baseConfig, ...overrides };

export default config;
