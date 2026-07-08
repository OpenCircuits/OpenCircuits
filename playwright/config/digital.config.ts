import baseConfig, { DevProjects, DevWebServers } from "./base.config.ts";

import type { PlaywrightTestConfig } from "@playwright/test";

const overrides: PlaywrightTestConfig = {
    testDir: "../digital",

    webServer: DevWebServers.digital,

    projects: DevProjects.digital,
};

const config: PlaywrightTestConfig = { ...baseConfig, ...overrides };

export default config;
