

import {Images} from "./utils/Images";
// import {ICDesignerController} from "./controllers/ICDesignerController";
import {MainDesignerController} from "./controllers/MainDesignerController";
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
    // ICDesignerController.Init();

    MainDesignerController.Render();
    // InputController.Init();
}

Start();
