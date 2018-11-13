// @flow
var V = require("../../../utils/math/Vector").V;
var Gate = require("../Gate");

class ORGate extends Gate {

    constructor(context, not, x, y) {
        super(context, not, x, y, images["or.svg"]);
    }

    setInputAmount(target) {
        super.setInputAmount(target);

        for (var i = 0; i < this.inputs.length; i++) {
            var input = this.inputs[i];
            var t = ((input.origin.y) / this.transform.size.y + 0.5) % 1.0;
            if (t < 0)
                t += 1.0;
            var x = this.quadCurveXAt(t);
            input.origin = V(x, input.origin.y);
        }
    }
    activate(signal: boolean) {
        var on = false;
        for (var i = 0; i < this.inputs.length; i++)
            on = (on || this.inputs[i].isOn);
        super.activate(on);
    }

    getDisplayName() {
        return this.not ? "NOR Gate" : "OR Gate";
    }
}
ORGate.getXMLName = function() { return "orgate"; }
Importer.types.push(ORGate);
