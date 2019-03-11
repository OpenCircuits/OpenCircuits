import "./polyfill.js";

import {Images} from "./utils/Images";
import {MainDesignerController} from "./controllers/MainDesignerController";
import {ICDesignerController} from "./controllers/ICDesignerController";
import {HeaderController} from "./controllers/HeaderController";
import {ItemNavController} from "./controllers/ItemNavController";
// import {InputController} from "./utils/input/InputController";
import {ContextMenuController} from "./controllers/ContextMenuController";
import {SelectionPopupController} from "./controllers/SelectionPopupController";

function Start() {
    Load(Init);
}

function Load(onFinishLoading: () => void) {
    Images.Load(onFinishLoading);
}

function Init() {
    // Initialize all controllers
    MainDesignerController.Init();
    ICDesignerController.Init();
    HeaderController.Init(MainDesignerController.GetDesigner());
    ItemNavController.Init(MainDesignerController.GetDesigner());
    ContextMenuController.Init();
    SelectionPopupController.Init(MainDesignerController.GetCamera());
    // ICDesignerController.Init();

    MainDesignerController.Render();
    // InputController.Init();
}

Start();
