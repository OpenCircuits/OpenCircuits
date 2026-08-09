import type { PlaywrightTestConfig } from "@playwright/test";

import baseConfig, { DevProjects, DevWebServers } from "./base.config";

const overrides: PlaywrightTestConfig = {
    testDir: "../landing",

    webServer: DevWebServers.landing,

    projects: DevProjects.landing,
};

const config: PlaywrightTestConfig = { ...baseConfig, ...overrides };

export default config;
