import baseConfig from "./base.config.js";

import type {PlaywrightTestConfig} from "@playwright/test";


const overrides: PlaywrightTestConfig = {
    testDir: "../landing",

    /* Run your local dev server before starting the tests */
    webServer: {
        command:             "cd ../../ && node ./build/scripts/start.js --project=landing",
        port:                3000,
        reuseExistingServer: true,
    },
}

const config: PlaywrightTestConfig = { ...baseConfig, ...overrides };

export default config;
