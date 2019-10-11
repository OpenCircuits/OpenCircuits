import "../polyfill.js";

import {SAVED} from "core/utils/Config";
import {Images} from "analog/utils/Images";

import {LoadingScreen} from "site/shared/views/LoadingScreen";
import {AnalogCircuitController} from "./controllers/AnalogCircuitController";


// Prompt for exit
window.onbeforeunload = (e) => {
    if (PRODUCTION && !SAVED) {
        const dialogText = "You have unsaved changes.";
        e.returnValue = dialogText;
        return dialogText;
    }
};

function Init(): void {
    LoadingScreen.Show();

    const promises = [
        new Promise((resolve, _) => {
            Images.Load(() => {
                resolve(1);
            });
        })
    ];

    Promise.all(promises).then(async () => {
        const main = new AnalogCircuitController();
        await main.init();
        main.render();
        // main.render();
        LoadingScreen.Hide();
    });
}

Init();
