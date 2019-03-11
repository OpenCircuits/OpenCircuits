import {LoadingScreen} from "./utils/LoadingScreen";
import {Images} from "./utils/Images";
import {MainDesignerController} from "./controllers/MainDesignerController";
import {ICDesignerController} from "./controllers/ICDesignerController";
import {HeaderController} from "./controllers/HeaderController";
import {ItemNavController} from "./controllers/ItemNavController";
// import {InputController} from "./utils/input/InputController";
import {ContextMenuController} from "./controllers/ContextMenuController";
import {SelectionPopupController} from "./controllers/SelectionPopupController";

function Init() {
    LoadingScreen.Render();

    const promise = new Promise((resolve, reject) => {
        // Initialize all controllers
        MainDesignerController.Init();
        ICDesignerController.Init();
        HeaderController.Init(MainDesignerController.GetDesigner());
        ItemNavController.Init(MainDesignerController.GetDesigner());
        ContextMenuController.Init();
        SelectionPopupController.Init(MainDesignerController.GetCamera());
        ICDesignerController.Init();
        resolve(1);
    });

    promise.then((val)=>{
        MainDesignerController.Render();
        // InputController.Init();    
    });
}

function Load(onFinishLoading: () => void) {
    Images.Load(onFinishLoading);
}

function Start() {
    Load(Init);
}

Start();
