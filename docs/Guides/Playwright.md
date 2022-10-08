---
title: Playwright
---

Playwright is an end-to-end testing framework that allows us to write tests that represent how the site is actually used. This allows for broader testing than our unit tests.

---

## Basic Operation

To run the tests, you can use the commands
```bash
yarn playwright:digital
yarn playwright:landing
```
to execute the tests for the digital site and the landing site, respectively.

Alternatively, you can run
```bash
npx playwright test
```
to run the tests using whichever config is loaded into `playwright.config.ts`, which is the digital site by default. This approach is not recommended.

Options such as `--debug` can be passed into those yarn wrapper commands, and the syntax would simply look like
```bash
yarn playwright:digital --debug
```

---

## Project and Test Folder Structure

There are 5 different browsers that our Playwright tests can target:
1. `chromium` (which powers Google Chrome)
2. `webkit` (which powers Safari)
3. `firefox`
4. `Mobile Chrome` (also referred to as `android`)
5. `Mobile Safari` (also referred to as `iphone`)

Playwright test files use the `.spec.ts` file extension, and can be found in the subdirectories of the `playwright` directory. The general subdirectory structure is `./playwright/{site}/{browserCategory}/{browserName}/{testFile}.spec.ts`. `{site}` can be `digital` or `landing` and `{browserCategory}` can be `desktop`, `mobile`, or `shared`.

- If `{browserCategory}` is `desktop`, then `{browserName}` can be `chromium`, `webkit`, `firefox`, or `shared`.
- If `{browserCategory}` is `mobile`, then `{browserName}` can be `android`, `iphone`, or `shared`.
- If `{browserCategory}` is `shared`, then there will be no `{browserName}` subdirectory.

A test in a `shared` folder will run for all the relevant browsers. For example, `./playwright/digital/desktop/shared/basicCircuit.spec.ts` will run for `chromium`, `webkit`, and `firefox`. `./playwright/landing/shared/basicLanding.spec.ts` will run for all 5 browsers.

---

## Running Tests Under Prod Site

To run the tests under the version of the site compiled for prod, use
```bash
yarn playwright:ci
```
This is how the tests are run in the GitHub action on prs.

This command is also used with the GitHub action for updating snapshots.
If you want to run it in this way locally, set the `UPDATE_SNAPSHOTS_COMMAND` environment variable to the desired command.
See the following section for more.

:::note

Currently only digital has a "prod" version, so landing still uses the dev version.

:::

---

## Creating/Updating Snapshots

Due to our usage of canvas, the best way to test is by comparing screenshots of the site at certain states. The difficulty with this is different operating systems have different rendering quirks, primarly with text. As a result, Playwright supports saving separate images for different operating systems.

Sometimes the intended snapshot should be updated, or a new test adds a new snapshot. This can be tricky as then the snapshots need to be updated on Windows, Linux, and Mac. It is not realistic to expect contributors to have access to all three operating systems, so instead we can delegate this work to a GitHub action. The GitHub action is launched by leaving a comment on a pull request of the following format:
```
/update-snapshots {OSes} {Tests}
```
`{OSes}` is a comma separated list of operating systems (windows-latest, ubuntu-latest, and macos-latest) to generate the snapshots on.
`{Tests}` is a space separated list of tests to run.

For example,
```
/update-snapshots windows-latest,ubuntu-latest digital/desktop/shared/basicCircuit digital/mobile/shared/basicCircuit
```
will generate the Windows and Linux snapshots for the tests `./playwright/digital/desktop/shared/basicCircuit.spec.ts` and
`./playwright/digital/mobile/shared/basicCircuit.spec.ts`.

After that example action executes, you will see the commits `[CI] Update Snapshots windows-latest` and `[CI] Update Snapshots ubuntu-latest` added to your pull request (assuming there were snapshots to create/update).
