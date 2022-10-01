import baseConfig, {DevProjects, DevWebServers, ProdProjects, ProdWebServers} from "./base.config.js";

import type {PlaywrightTestConfig} from "@playwright/test";


// TODO: This should only use prod version once those all exist
// Generate snapshots through the dev version
const overrides: PlaywrightTestConfig = {
    testDir: ".././",

    webServer: [DevWebServers.landing, ProdWebServers.digital],

    projects: [...DevProjects.landing, ...ProdProjects.digital],
}

const config: PlaywrightTestConfig = { ...baseConfig, ...overrides };

export default config;
