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

async function Init(): Promise<void> {
    const main = new AnalogCircuitController();

    LoadingScreen.Show();

    await Images.Load();
    await main.init();
    main.render();

    LoadingScreen.Hide();
}

Init();
