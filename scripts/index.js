#!/usr/bin/env node
require("yargs")
    .usage("Usage: $0 <command> [options]")
    .command("build", "Production build", {}, require("./prodBuild"))
    .command("start", "Start a dev server build", {}, require("./devBuild"))
    .demandCommand()
    .help()
    .argv;
