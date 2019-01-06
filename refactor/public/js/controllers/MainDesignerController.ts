import {LEFT_MOUSE_BUTTON,
        OPTION_KEY,
        SHIFT_KEY} from "../utils/Constants";

import {V} from "../utils/math/Vector";
import {Transform} from "../utils/math/Transform";
import {Input} from "../utils/Input";
import {RenderQueue} from "../utils/RenderQueue";
import {ActionManager} from "../utils/actions/ActionManager";

import {CircuitDesigner} from "../models/CircuitDesigner";

import {MainDesignerView} from "../views/MainDesignerView";

import {Tool} from "../utils/tools/Tool";
import {PanTool} from "../utils/tools/PanTool";
import {SelectionTool} from "../utils/tools/SelectionTool";

import {IOObject} from "../models/ioobjects/IOObject";
import {Switch}   from "../models/ioobjects/inputs/Switch";
import {ANDGate}  from "../models/ioobjects/gates/ANDGate";
import {LED}      from "../models/ioobjects/outputs/LED";

export var MainDesignerController = (function() {
    var designer: CircuitDesigner;
    var view: MainDesignerView;
    var input: Input;

    var actions: ActionManager;

    var renderQueue: RenderQueue;

    // tools
    var panTool: PanTool;
    var selectionTool: SelectionTool;
    var currentTool: Tool;

    let resize = function() {
        view.resize();

        renderQueue.render();
    }

    let onMouseDrag = function(button: number): void {
        // If current tool did something, then render
        if (currentTool.onMouseDrag(input, button))
            renderQueue.render();
    }

    let onMouseUp = function(button: number): void {
        // If current tool did something, then render
        if (currentTool.onMouseUp(input, button))
            renderQueue.render();
    }

    let onClick = function(button: number): void {
        // if (button === LEFT_MOUSE_BUTTON) {
        //
        //     // Clear selections if no shift key
        //     if (!input.isKeyDown(SHIFT_KEY))
        //         selections = [];
        //
        //     // Check if an object/wire was clicked
        //     //  and add to selections
        //     let objects = designer.getObjects();
        //     for (let i = objects.length-1; i >= 0; i--) {
        //         var obj = objects[i];
        //
        //         // @TODO figure out how to differentiate between
        //         //  'selection box' and 'pressable box thing'
        //
        //     }
        //
        // }
    }

    let onScroll = function(): void {
        // @TODO move this stuff as well
        var zoomFactor = input.getZoomFactor();

        // Calculate position to zoom in/out of
        var pos0 = view.getCamera().getWorldPos(input.getMousePos());
        view.getCamera().zoomBy(zoomFactor);
        var pos1 = view.getCamera().getScreenPos(pos0);
        var dPos = pos1.sub(input.getMousePos());
        view.getCamera().translate(dPos.scale(view.getCamera().getZoom()));

        renderQueue.render();
    }

    let onKeyDown = function(key: number): void {

        // Switch to to pan tool
        if (currentTool === selectionTool &&
            key === OPTION_KEY) {
            currentTool = panTool;
            console.log("switch to pan");
        }

    }

    let onKeyUp = function(key: number): void {

        // Switch to selection tool
        if (currentTool === panTool &&
            key === OPTION_KEY) {
            currentTool = selectionTool;
            console.log("switch to sel");
        }

    }

    return {
        Init: function(): void {
            // model/view
            designer = new CircuitDesigner();
            view = new MainDesignerView();

            // utils
            renderQueue = new RenderQueue(() => this.Render());
            actions = new ActionManager();

            // tools
            panTool = new PanTool(view.getCamera());
            selectionTool = new SelectionTool(designer, view.getCamera());
            currentTool = selectionTool;

            // input
            input = new Input(view.getCanvas());
            input.addListener("mousedrag", onMouseDrag);
            input.addListener("mouseup", onMouseUp);
            input.addListener("click", onClick);
            input.addListener("scroll", onScroll);
            input.addListener("keydown", onKeyDown);
            input.addListener("keyup", onKeyUp);

            window.addEventListener("resize", _e => resize(), false);


            var s1 = new Switch();
            var s2 = new Switch();
            var g1 = new ANDGate();
            var l1 = new LED();

            s1.setPos(V(-200, 100));
            s2.setPos(V(-200, -100));
            g1.setPos(V(0, 0));
            l1.setPos(V(200, 0));

            designer.addObjects([s1, s2, g1, l1]);

            designer.connect(s1, 0,  g1, 0);
            designer.connect(s2, 0,  g1, 1);

            designer.connect(g1, 0,  l1, 0);

            s1.activate(true);

            console.log("LED active: " + l1.isOn().toString());

            s1.activate(false);
            s2.activate(true);

            console.log("LED active: " + l1.isOn().toString());

            s1.activate(true);

            console.log("LED active: " + l1.isOn().toString());
        },
        Render: function(): void {
            view.render(designer, selectionTool.getSelections(), currentTool);
        }
    };
})();
