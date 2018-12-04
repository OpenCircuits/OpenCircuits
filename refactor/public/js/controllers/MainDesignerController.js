// @flow
const LEFT_MOUSE_BUTTON = require("../utils/Constants").LEFT_MOUSE_BUTTON;

var V = require("../utils/math/Vector").V;
var Input = require("../utils/Input");

var CircuitDesigner = require("../models/CircuitDesigner");

var MainDesignerView = require("../views/MainDesignerView");



var Switch = require("../models/ioobjects/inputs/Switch");
var ANDGate = require("../models/ioobjects/gates/ANDGate");
var LED = require("../models/ioobjects/outputs/LED");

var MainDesignerController = (function() {
    var designer: CircuitDesigner;
    var view: MainDesignerView;
    var input: Input;

    // var currentTool: Tool;

    let resize = function() {
        view.resize();

        MainDesignerController.Render();
    }

    let onMouseDrag = function(button: number) {
        if (button === LEFT_MOUSE_BUTTON) {
            var shouldRender = false;
            // contextmenu.hide();
            // shouldRender = CurrentTool.onMouseDown(shouldRender);
            // for (var i = 0; i < mouseListeners.length; i++) {
            //     var listener = mouseListeners[i];
            //     if (!listener.disabled && listener.onMouseDown(shouldRender))
            //         shouldRender = true;
            // }
            if (shouldRender)
                MainDesignerController.Render();
        }
    }

    return {
        Init: function(): void {
            designer = new CircuitDesigner();
            view = new MainDesignerView();
            input = new Input(view.getCanvas());
            input.addListener("mousedrag", onMouseDrag);

            window.addEventListener('resize', e => resize(), false);



            var s1 = new Switch();
            var s2 = new Switch();
            var g1 = new ANDGate();
            var l1 = new LED();

            s1.setPos(V(-100, -100));
            s2.setPos(V(-100, 100));
            g1.setPos(V(0, 0));
            l1.setPos(V(100, 0));

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

module.exports = MainDesignerController;
