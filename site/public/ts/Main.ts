import "./polyfill.js";

import {SAVED} from "./utils/Config";
import {Images} from "./utils/Images";
import {MainDesignerController} from "./controllers/MainDesignerController";
import {ICDesignerController} from "./controllers/ICDesignerController";
import {HeaderController} from "./controllers/HeaderController";
import {LoginController} from "./controllers/LoginController";
import {CopyController} from "./controllers/CopyController";
import {ItemNavController} from "./controllers/ItemNavController";
import {SideNavController} from "./controllers/SideNavController";
import {ContextMenuController} from "./controllers/ContextMenuController";
import {SelectionPopupController} from "./controllers/SelectionPopupController";

import {LoadingScreen} from "./views/LoadingScreen";


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
        }),
        new Promise((resolve, _) => {
            MainDesignerController.Init();
            SelectionPopupController.Init(MainDesignerController.GetCamera());
            resolve(1);
        }),
        new Promise((resolve, _) => {
            CopyController.Init();
            resolve(1);
        }),
        new Promise((resolve, _) => {
            ICDesignerController.Init();
            resolve(1);
        }),
        new Promise((resolve, _) => {
            ContextMenuController.Init();
            resolve(1);
        }),
        new Promise((resolve, _) => {
            ItemNavController.Init();
            resolve(1);
        }),
        new Promise((resolve, _) => {
            SideNavController.Init();
            resolve(1);
        }),
        HeaderController.Init(),
        LoginController.Init()
    ];

    Promise.all(promises).then(() => {
        MainDesignerController.Render();
        LoadingScreen.Hide();
    });
}

Init();
