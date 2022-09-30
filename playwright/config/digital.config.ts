import baseConfig from "./base.config.js";

import type {PlaywrightTestConfig} from "@playwright/test";


const overrides: PlaywrightTestConfig = {
    testDir: "../digital",

    /* Run your local dev server before starting the tests */
    webServer: {
        command:             "cd ../../ && node ./build/scripts/start.js --project=digital",
        port:                3000,
        reuseExistingServer: true,
    },
}

const config: PlaywrightTestConfig = { ...baseConfig, ...overrides };

export default config;
