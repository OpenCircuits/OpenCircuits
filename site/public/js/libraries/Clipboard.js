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
        var data = Exporter.write(ctx);
        e.clipboardData.setData("text/plain", data);
        e.preventDefault();
    }
    cut(e) {
        this.copy(e);
        RemoveObjects(getCurrentContext(), selectionTool.selections, true);
        e.preventDefault();
    }
    paste(e) {
        console.log("ASd");
        var group = Importer.load(e.clipboardData.getData("text/plain"), getCurrentContext());
        var objects = group.objects;
        var wires = group.wires;

        var action = new GroupAction();

        for (var i = 0; i < objects.length; i++) {
            objects[i].setPos(objects[i].getPos().add(V(5, 5)));
            action.add(new PlaceAction(objects[i]));
        }

        getCurrentContext().addAction(action);

        selectionTool.deselectAll();
        selectionTool.select(objects);

        render();
        e.preventDefault();
    }
}
var clipboard = new Clipboard();