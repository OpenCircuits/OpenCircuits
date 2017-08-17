class Clipboard {
    constructor() {
        document.addEventListener('copy', e => {this.copy(e)}, false);
        document.addEventListener('cut', e => {this.cut(e)}, false);
        document.addEventListener('paste', e => {this.paste(e)}, false);
    }
    copy(e) {
        var selections = selectionTool.selections;
        var things = getAllThingsBetween(selections);
        var objects = [];
        var wires = [];
        for (var i = 0; i < things.length; i++) {
            if (things[i] instanceof Wire)
                wires.push(things[i]);
            else
                objects.push(things[i]);
        }
        var ctx = {getObjects: function() {return objects;}, getWires: function() {return wires;}};
        var data = writeFile(ctx);
        e.clipboardData.setData("text/plain", data);
        e.preventDefault();
    }
    cut(e) {
        copy(e);
        selectionTool.removeSelections();
        e.preventDefault();
    }
    paste(e) {
        var data = e.clipboardData.getData("text/plain");
        var xml = new window.DOMParser().parseFromString(data, "text/xml");
        var group = loadProject(xml);
        var objects = group.objects;
        var wires = group.wires;

        // var context = getCurrentContext();
        // if (this.clipboard != undefined) {
        //     var copy = copyGroup(this.clipboard.objects);
        //     var objects = copy.objects;
        //     var wires = copy.wires;
        //     var action = new GroupAction();
        //     for (var i = 0; i < objects.length; i++) {
        //         context.addObject(objects[i]);
        //         objects[i].setPos(objects[i].getPos().add(V(5,5)));
        //         action.add(new PlaceAction(objects[i]));
        //     }
        //     for (var i = 0; i < wires.length; i++) {
        //         context.addWire(wires[i]);
        //         action.add(new PlaceWireAction(wires[i]));
        //     }
        //     context.addAction(action);
        //     selectionTool.deselect();
        //     selectionTool.select(objects);
        //     render();
        // }
        e.preventDefault();
    }
}
