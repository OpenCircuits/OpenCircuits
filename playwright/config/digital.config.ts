import type { PlaywrightTestConfig } from "@playwright/test";

import baseConfig, { DevProjects, DevWebServers } from "./base.config";

const overrides: PlaywrightTestConfig = {
    testDir: "../digital",

    webServer: DevWebServers.digital,

    projects: DevProjects.digital,
};

const config: PlaywrightTestConfig = { ...baseConfig, ...overrides };

export default config;
