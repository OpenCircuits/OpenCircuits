// @flow

var Images = require("./utils/Images");
// var ICDesignerController = require("./controllers/ICDesignerController");
var MainDesignerController = require("./controllers/MainDesignerController");
// var InputController = require("./utils/input/InputController");

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
