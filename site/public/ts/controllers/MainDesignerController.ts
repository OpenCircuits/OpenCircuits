import {LEFT_MOUSE_BUTTON,
        OPTION_KEY,
        SHIFT_KEY,
        IO_PORT_RADIUS,
        ROTATION_CIRCLE_R1,
        ROTATION_CIRCLE_R2} from "../utils/Constants";

import {Vector, V} from "../utils/math/Vector";
import {Transform} from "../utils/math/Transform";
import {RectContains,CircleContains} from "../utils/math/MathUtils";
import {Camera} from "../utils/Camera";
import {Input} from "../utils/Input";
import {RenderQueue} from "../utils/RenderQueue";
import {Action} from "../utils/actions/Action";
import {ActionManager} from "../utils/actions/ActionManager";

import {CircuitDesigner} from "../models/CircuitDesigner";

import {MainDesignerView} from "../views/MainDesignerView";

import {ToolManager} from "../utils/tools/ToolManager";

import {MouseListener} from "../utils/MouseListener";

import {PressableComponent} from "../models/ioobjects/PressableComponent";
import {Component} from "../models/ioobjects/Component";
import {IOObject} from "../models/ioobjects/IOObject";
import {InputPort} from "../models/ioobjects/InputPort";
import {Switch}   from "../models/ioobjects/inputs/Switch";
import {Button}   from "../models/ioobjects/inputs/Button";
import {ANDGate}  from "../models/ioobjects/gates/ANDGate";
import {ORGate}  from "../models/ioobjects/gates/ORGate";
import {XORGate}  from "../models/ioobjects/gates/XORGate";
import {Multiplexer} from "../models/ioobjects/other/Multiplexer";
import {Demultiplexer} from "../models/ioobjects/other/Demultiplexer";
import {LED}      from "../models/ioobjects/outputs/LED";
import {SelectionPopupController} from "./SelectionPopupController";

export var MainDesignerController = (function() {
    var designer: CircuitDesigner;
    var view: MainDesignerView;
    var input: Input;

    var toolManager: ToolManager;
    var renderQueue: RenderQueue;

    let resize = function() {
        view.resize();

        MainDesignerController.Render();
    }

    let onMouseDown = function(button: number): void {
        if (toolManager.onMouseDown(input, button))
            MainDesignerController.Render();
    }

    let onMouseMove = function(): void {
        if (toolManager.onMouseMove(input))
            MainDesignerController.Render();
    }

    let onMouseDrag = function(button: number): void {
        if (toolManager.onMouseDrag(input, button)) {
            SelectionPopupController.Hide();
            MainDesignerController.Render();
        }
    }

    let onMouseUp = function(button: number): void {
        if (toolManager.onMouseUp(input, button)) {
            SelectionPopupController.Update();
            MainDesignerController.Render();
        }
    }

    let onClick = function(button: number): void {
        if (toolManager.onClick(input, button))
            MainDesignerController.Render();
    }

    let onKeyDown = function(key: number): void {
        if (toolManager.onKeyDown(input, key))
            MainDesignerController.Render();
    }

    let onKeyUp = function(key: number): void {
        if (toolManager.onKeyUp(input, key))
            MainDesignerController.Render();
    }

    let onScroll = function(): void {
        // @TODO move this stuff as well
        let zoomFactor = input.getZoomFactor();

        // Calculate position to zoom in/out of
        let pos0 = view.getCamera().getWorldPos(input.getMousePos());
        view.getCamera().zoomBy(zoomFactor);
        let pos1 = view.getCamera().getScreenPos(pos0);
        let dPos = pos1.sub(input.getMousePos());
        view.getCamera().translate(dPos.scale(view.getCamera().getZoom()));

        SelectionPopupController.Update();
        MainDesignerController.Render();
    }
    return {
        Init: function(): void {
            // pass Render function so that
            //  the circuit is redrawn every
            //  time its updated
            designer = new CircuitDesigner(1, () => this.Render());
            view = new MainDesignerView();

            // utils
            toolManager = new ToolManager(view.getCamera(), designer);
            renderQueue = new RenderQueue(() =>
                view.render(designer,
                            toolManager.getSelectionTool().getSelections(),
                            toolManager));

            // input
            input = new Input(view.getCanvas());
            input.addListener("click",     (b) => onClick(b));
            input.addListener("mousedown", (b) => onMouseDown(b));
            input.addListener("mousedrag", (b) => onMouseDrag(b));
            input.addListener("mousemove", ( ) => onMouseMove());
            input.addListener("mouseup",   (b) => onMouseUp(b));
            input.addListener("keydown",   (b) => onKeyDown(b));
            input.addListener("keyup",     (b) => onKeyUp(b));
            input.addListener("scroll", onScroll);

            window.addEventListener("resize", _e => resize(), false);

            toolManager.getSelectionTool().addSelectionChangeListener( () => SelectionPopupController.Update() );

            var s1 = new Switch();
            var s2 = new Switch();
            var g1 = new ANDGate();
            var l1 = new LED();

            var b = new Button();
            designer.addObject(b);

            s1.setPos(V(-200, 100));
            s2.setPos(V(-200, -100));
            g1.setPos(V(0, 0));
            l1.setPos(V(200, 0));

            designer.addObjects([s1, s2, g1, l1]);

            var g2 = new XORGate();
            g2.setPos(V(0, 200));
            g2.setInputPortCount(5);
            designer.addObject(g2);

            var g3 = new ORGate();
            g3.setPos(V(0, -200));
            g3.setInputPortCount(5);
            designer.addObject(g3);

            var m1 = new Multiplexer();
            m1.setPos(V(400, 0));
            designer.addObject(m1);

            var d1= new Demultiplexer();
            d1.setPos(V(-400,0));
            designer.addObject(d1);

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
            renderQueue.render();
        },
        ClearSelections: function(): void {
            toolManager.getSelectionTool().clearSelections();
        },
        PlaceComponent: function(component: Component) {
            toolManager.placeComponent(component);
        },
        GetSelections: function(): Array<IOObject> {
            return toolManager.getSelectionTool().getSelections();
        },
        GetCanvas: function(): HTMLCanvasElement {
            return view.getCanvas();
        },
        GetCamera: function(): Camera {
            return view.getCamera();
        },
        GetDesigner: function(): CircuitDesigner {
            return designer;
        }
    };
})();
