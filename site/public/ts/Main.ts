import "./polyfill.js";

import {SAVED} from "./utils/Config";
import {Images} from "./utils/Images";
import {MainDesignerController} from "./controllers/MainDesignerController";
import {ICDesignerController} from "./controllers/ICDesignerController";
import {HeaderController} from "./controllers/HeaderController";
import {ItemNavController} from "./controllers/ItemNavController";
import {SideNavController} from "./controllers/SideNavController";
import {ContextMenuController} from "./controllers/ContextMenuController";
import {SelectionPopupController} from "./controllers/SelectionPopupController";

import {LoadingScreen} from "./views/LoadingScreen";

function Init() {
    LoadingScreen.Show();

    const promises = [
        new Promise((resolve, reject) => {
            Images.Load(function() {
                resolve(1);
            });
        }),
        new Promise((resolve, reject) => {
            MainDesignerController.Init();
            HeaderController.Init(MainDesignerController.GetDesigner());
            SelectionPopupController.Init(MainDesignerController.GetCamera());
            resolve(1);
        }),
        new Promise((resolve, reject) => {
            ICDesignerController.Init();
            resolve(1);
        }),
        new Promise((resolve, reject) => {
            ContextMenuController.Init();
            resolve(1);
        }),
        new Promise((resolve, reject) => {
            ItemNavController.Init();
            resolve(1);
        }),
        new Promise((resolve, reject) => {
            SideNavController.Init();
            resolve(1);
        }),
        new Promise((resolve, reject) => {
            // Prompt for exit
            window.onbeforeunload = (e) => {
                if (PRODUCTION && !SAVED) {
                    const dialogText = "You have unsaved changes.";
                    e.returnValue = dialogText;
                    return dialogText;
                }
            };
            resolve(1);
        })
    ];

    Promise.all(promises).then((val) => {
        MainDesignerController.Render();
        LoadingScreen.Hide();
    });
}

Init();
