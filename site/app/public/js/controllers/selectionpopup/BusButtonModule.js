class BusButtonModule extends Module {
    constructor(parent, divName) {
        super(parent, divName);
    }
    onShow() {
        var iports = 0, oports = 0;
        var selections = selectionTool.selections;
        for (var i = 0; i < selections.length; i++) {
            if (selections[i] instanceof IPort) {
                iports++;
            } else if (selections[i] instanceof OPort) {
                oports++;
            } else {
                this.setVisibility("none");
                return;
            }
        }
        this.setVisibility(iports === oports ? "inherit" : "none");
    }
    onClick() {
        this.createBus();
    }
    createBus() {
        var selections = selectionTool.selections;
        
        var iports = [], oports = [];
        for (var i = 0; i < selections.length; i++) {
            if (selections[i] instanceof IPort)
                iports.push(selections[i]);
            else
                oports.push(selections[i]);
        }

        while (oports.length > 0) {
            var maxDist = -Infinity, maxDistIndex = -1, maxMinDistIndex = -1;
            for (var i = 0; i < oports.length; i++) {
                var oport = oports[i];
                var opos = oport.getPos();
                var minDist = Infinity, minDistIndex = -1;
                for (var j = 0; j < iports.length; j++) {
                    var iport = iports[j];
                    var dist = opos.sub(iport.getPos()).len2();
                    if (dist < minDist) {
                        minDist = dist;
                        minDistIndex = j;
                    }
                }
                if (minDist > maxDist) {
                    maxDist = minDist;
                    maxDistIndex = i;
                    maxMinDistIndex = minDistIndex;
                }
            }
            var wire = new Wire(context);
            getCurrentContext().add(wire);
            oports[maxDistIndex].connect(wire);
            wire.connect(iports[maxMinDistIndex]);
            wire.set = true;
            wire.straight = true;
            oports.splice(maxDistIndex, 1);
            iports.splice(maxMinDistIndex, 1);
        }
        render();
    }
}
