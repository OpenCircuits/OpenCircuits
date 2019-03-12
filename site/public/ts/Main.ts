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
    const promises = [
        new Promise((resolve, reject) => {
            MainDesignerController.Init();
            HeaderController.Init(MainDesignerController.GetDesigner());
            ItemNavController.Init(MainDesignerController.GetDesigner());
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
        })
    ];

    Promise.all(promises).then((val)=>{
        LoadingScreen.Hide()
        MainDesignerController.Render();
        // InputController.Init();    
    });
}

function Load(onFinishLoading: () => void) {
    LoadingScreen.Show();
    Images.Load(onFinishLoading);
}

function Start() {
    Load(Init);
}

Start();
