import {LEFT_MOUSE_BUTTON,
        OPTION_KEY,
        SHIFT_KEY} from "../utils/Constants";

import {V} from "../utils/math/Vector";
import {Transform} from "../utils/math/Transform";
import {Input} from "../utils/Input";
import {RenderQueue} from "../utils/RenderQueue";
import {ActionManager} from "../utils/actions/ActionManager";
import {TransformContains} from "../utils/math/MathUtils";

import {CircuitDesigner} from "../models/CircuitDesigner";

import {MainDesignerView} from "../views/MainDesignerView";

import {Tool} from "../utils/tools/Tool";
import {PanTool} from "../utils/tools/PanTool";

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

    var selections: Array<IOObject> = [];
    var selecting: boolean = false;

    // tools
    var panTool: PanTool;
    var currentTool: Tool;

    let resize = function() {
        view.resize();

        renderQueue.render();
    }

    let onMouseDrag = function(button: number): void {
        if (button === LEFT_MOUSE_BUTTON) {
            var shouldRender = false;


            // @TODO Move this to a PanTool class or something
            if (!selecting && input.isKeyDown(OPTION_KEY)) {
                var dPos = input.getDeltaMousePos();
                view.getCamera().translate(dPos.scale(-1*view.getCamera().getZoom()));
                shouldRender = true;
            } else {
                selecting = true;
            }

            // contextmenu.hide();
            // shouldRender = CurrentTool.onMouseDown(shouldRender);
            // for (var i = 0; i < mouseListeners.length; i++) {
            //     var listener = mouseListeners[i];
            //     if (!listener.disabled && listener.onMouseDown(shouldRender))
            //         shouldRender = true;
            // }

            if (shouldRender)
                renderQueue.render();
        }
    }

    let onMouseUp = function(button: number): void {
        if (button === LEFT_MOUSE_BUTTON) {

            // Stop selection box
            if (selecting) {
                selecting = false;

                // Clear selections if no shift key
                if (!input.isKeyDown(SHIFT_KEY))
                    selections = [];

                // Calculate transform rectangle of the selection box
                var p1 = view.getCamera().getWorldPos(input.getMouseDownPos());
                var p2 = view.getCamera().getWorldPos(input.getMousePos());
                var box = new Transform(p1.add(p2).scale(0.5), p2.sub(p1).abs());

                // Go through each object and see if it's within
                //  the selection box
                var objects = designer.getObjects();
                for (let obj of objects) {
                    // Check if object is in box
                    if (TransformContains(box, obj.getTransform())) {
                        // Add to selections if not already selected
                        if (!selections.includes(obj))
                            selections.push(obj);
                    }
                }

                renderQueue.render();
            }

        }
    }

    let onClick = function(button: number): void {
        if (button === LEFT_MOUSE_BUTTON) {

            // Clear selections if no shift key
            if (!input.isKeyDown(SHIFT_KEY))
                selections = [];

            // Check if an object/wire was clicked
            //  and add to selections
            let objects = designer.getObjects();
            for (let i = objects.length-1; i >= 0; i--) {
                var obj = objects[i];

                // @TODO figure out how to differentiate between
                //  'selection box' and 'pressable box thing'

            }

        }
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

    return {
        Init: function(): void {
            designer = new CircuitDesigner();
            view = new MainDesignerView();
            renderQueue = new RenderQueue(() => this.Render());
            actions = new ActionManager();

            input = new Input(view.getCanvas());
            input.addListener("mousedrag", onMouseDrag);
            input.addListener("mouseup", onMouseUp);
            input.addListener("click", onClick);
            input.addListener("scroll", onScroll);

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
            view.render(designer, selections);
        }
    };
})();
