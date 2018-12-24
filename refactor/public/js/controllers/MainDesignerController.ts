import {LEFT_MOUSE_BUTTON, OPTION_KEY} from "../utils/Constants";

import {V} from "../utils/math/Vector";
import {Input} from "../utils/Input";
import {RenderQueue} from "../utils/RenderQueue";

import {CircuitDesigner} from "../models/CircuitDesigner";

import {MainDesignerView} from "../views/MainDesignerView";

import {Switch}  from "../models/ioobjects/inputs/Switch";
import {ANDGate} from "../models/ioobjects/gates/ANDGate";
import {LED}     from "../models/ioobjects/outputs/LED";

export var MainDesignerController = (function() {
    var designer: CircuitDesigner;
    var view: MainDesignerView;
    var input: Input;

    var renderQueue: RenderQueue;

    // var currentTool: Tool;

    let resize = function() {
        view.resize();

        renderQueue.render();
    }


    /**
     * onMouseDrag - Description
     *
     * @param {type} button Description
     *
     * @return {type} Description
     */
    let onMouseDrag = function(button: number): void {
        if (button === LEFT_MOUSE_BUTTON) {
            var shouldRender = false;


            // @todo move this to a PanTool class or something
            if (input.isKeyDown(OPTION_KEY)) {
                var dPos = input.getDeltaMousePos();
                view.camera.translate(dPos.scale(-1*view.camera.getZoom()));
                shouldRender = true;
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

    let onScroll = function(): void {
        // @todo move this stuff as well
        var zoomFactor = input.getZoomFactor();

        // Calculate position to zoom in/out of
        var pos0 = view.camera.getWorldPos(input.getMousePos());
        view.camera.zoomBy(zoomFactor);
        var pos1 = view.camera.getScreenPos(pos0);
        var dPos = pos1.sub(input.getMousePos());
        view.camera.translate(dPos.scale(view.camera.getZoom()));

        renderQueue.render();
    }

    return {
        Init: function(): void {
            designer = new CircuitDesigner();
            view = new MainDesignerView();
            renderQueue = new RenderQueue(() => this.Render());
            input = new Input(view.getCanvas());
            input.addListener("mousedrag", onMouseDrag);
            input.addListener("scroll", onScroll);

            window.addEventListener("resize", _e => resize(), false);



            var s1 = new Switch();
            var s2 = new Switch();
            var g1 = new ANDGate();
            var l1 = new LED();

            s1.setPos(V(-200, -100));
            s2.setPos(V(-200, 100));
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
            view.render(designer, []);
        }
    };
})();
