

import {Images} from "./utils/Images";
// import {ICDesignerController} from "./controllers/ICDesignerController";
import {MainDesignerController} from "./controllers/MainDesignerController";
import {HeaderController} from "./controllers/HeaderController";
// import {InputController} from "./utils/input/InputController";

function Start() {
    Load(Init);
}

function Load(onFinishLoading: () => void) {
    Images.Load(onFinishLoading);
}

function Init() {
    // Initialize all controllers
    MainDesignerController.Init();
    HeaderController.Init(MainDesignerController.GetDesigner());
    // ICDesignerController.Init();

    MainDesignerController.Render();
    // InputController.Init();
}

Start();
